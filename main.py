import requests
import random
import urllib.parse
import json
import os
from dotenv import load_dotenv
import html
from requests.exceptions import JSONDecodeError
from llama_cpp import Llama
import unicodedata
from newspaper import Article
from transformers import MarianMTModel, MarianTokenizer
import logging

logging.basicConfig(
    filename=os.environ.get("YOUR_LOG_FILE"),
    level=logging.DEBUG,
)

os.environ["CUDA_LAUNCH_BLOCKING"] = "1"

load_dotenv()

news_api_key = os.environ.get("NEWS_API_KEY")
pexels_api_key = os.environ.get("PEXELS_API_KEY")
my_domain_url = os.environ.get("MY_DOMAIN_URL")
email = os.environ.get("EMAIL")
password = os.environ.get("PASSWORD")
your_model = os.environ.get("YOUR_MODEL")

headers = {
    "Referer": "http://www.google.com",
    "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:90.0) Gecko/20100101 Firefox/90.0",
}


class Sanitizer:
    @staticmethod
    def sanitize_input(input_string):
        sanitized_input = input_string.strip().replace("'", "''")
        return Sanitizer.convert_html_entities_to_characters(sanitized_input)

    @staticmethod
    def convert_html_entities_to_characters(string):
        return html.unescape(string)


categories = [
    "business",
    "entertainment",
    "general",
    "health",
    "science",
    "sports",
    "technology",
]

llm = Llama(model_path=your_model, n_threads=4, n_ctx=4000)
tokenizer = MarianTokenizer.from_pretrained("Helsinki-NLP/opus-mt-en-fr")
model = MarianMTModel.from_pretrained("Helsinki-NLP/opus-mt-en-fr")

ins = """### Instruction:
{}
### Input:
{}
### Response:
"""


def generate(instruction, input, max_tokens):
    result = ""
    for x in llm(
        ins.format(instruction, input),
        stop=["### Input:", "### End"],
        stream=True,
        max_tokens=max_tokens,
    ):
        result += x["choices"][0]["text"]
    return result


def clean_text(text):
    return "".join(
        c
        for c in unicodedata.normalize("NFKD", text)
        if unicodedata.category(c) != "Mn"
    )


def translate(text, device="cuda", max_new_tokens=512):
    model.to(device)
    tokenized_text = tokenizer(
        text,
        return_tensors="pt",
        padding=True,
        truncation=True,
        max_length=max_new_tokens,
    ).to(device)
    translated_tokens = model.generate(**tokenized_text, max_new_tokens=max_new_tokens)
    translated_text = tokenizer.batch_decode(
        translated_tokens, skip_special_tokens=True
    )
    return translated_text


def fetch_news(category):
    url = f"https://newsapi.org/v2/top-headlines?country=us&category={category}&apiKey={news_api_key}"
    response = requests.get(url)
    data = response.json()

    if data["status"] == "ok":
        articles_with_sources = []

        for article in data["articles"]:
            article_with_source = {
                "title": article["title"],
                "description": article["description"],
                "content": article["content"],
                "url": article["url"],
                "urlToImage": article["urlToImage"],
                "publishedAt": article["publishedAt"],
                "source_id": article["source"]["id"],
                "source_name": article["source"]["name"],
            }
            articles_with_sources.append(article_with_source)

        return random.choice(articles_with_sources) if articles_with_sources else None

    return []


def extract_article_content(url):
    article = Article(url)
    article.download()
    article.parse()
    print(article.text)
    return article.text


def fetch_image_url(query):
    pexels_headers = {"Authorization": pexels_api_key}
    url = f"https://api.pexels.com/v1/search?query={urllib.parse.quote(query)}&per_page=1&page=1"
    try:
        response = requests.get(url, headers=pexels_headers)
        response.raise_for_status()

        try:
            json_data = response.json()
            image_url = json_data["photos"][0]["src"]["large"]
        except JSONDecodeError:
            print(f"Invalid JSON response from {url}")
            return None
        return image_url

    except requests.exceptions.RequestException as e:
        print(f"An error occurred while making a request to {url}: {e}")
        return None


def summarize_news(article):
    if not article:
        return None

    max_tokens = 1024
    prompt = "Please provide a large summary of the following news article, while ensuring the facts are accurately represented:"
    response = generate(clean_text(prompt), article, max_tokens)
    if response.startswith(prompt):
        response = response[len(prompt) :].strip(' "')
    print(response + "\n")
    return response


def summarize_article(article):
    max_tokens = 255
    prompt = "Please provide a concise summary of the following news article, while ensuring the facts are accurately represented:"
    response = generate(clean_text(prompt), article, max_tokens)
    if response.startswith(prompt):
        response = response[len(prompt) :].strip(' "')
    print(response + "\n")
    return response


def find_title(content):
    max_tokens = 48
    prompt = "Generate a concise title for the following news article:"
    response = generate(clean_text(prompt), content, max_tokens)
    if response.startswith(prompt):
        response = response[len(prompt) :].strip(' "')
    print(response + "\n")
    return response


def generate_email_response(username, message):
    max_tokens = 1024
    prompt = f"You are autoGenius, a news blog writer, {username} sent you this email via your blog, answer him on a professional way"
    response = generate(clean_text(prompt), message, max_tokens)
    if response.startswith(prompt):
        response = response[len(prompt) :].strip(' "')
    print(response + "\n")
    return response


def generate_response(short_content, comments):
    max_tokens = 64
    instruction = "Continue"
    prompt = f"@autoGenius: '{short_content}'\n"

    for comment in comments:
        prompt += f"@{comment['username']}: {comment['content']}\n"

    name = "@autoGenius:"
    prompt += name + " "

    response = generate(instruction, clean_text(prompt), max_tokens)
    if response.startswith(instruction):
        response = response[len(instruction) :].strip(' "')
    print(response + "\n")
    return response


def extract_keywords(content):
    max_tokens = 16
    prompt = "Summerize in only one word:"
    response = generate(clean_text(prompt), content, max_tokens)
    if response.startswith(prompt):
        response = response[len(prompt) :].strip(' "')
    print(response + "\n")
    return response


def send_to_api(category, title, content, image_url, short_content, sources, token):
    api_url = f"{my_domain_url}"
    category = Sanitizer.sanitize_input(category)
    title = Sanitizer.sanitize_input(title)
    content = Sanitizer.sanitize_input(content)
    image_url = Sanitizer.sanitize_input(image_url)
    short_content = Sanitizer.sanitize_input(short_content)
    sources = Sanitizer.sanitize_input(sources)
    data = {
        "category": category,
        "title": title,
        "short_content": short_content,
        "sources": sources,
        "content": content,
        "image_url": image_url,
        "token": token,
        "page": "articles",
    }
    response = requests.post(api_url, data=data, headers=headers)
    return response.status_code


def send_response(content, article_id, token):
    api_url = f"{my_domain_url}"
    data = {
        "content": Sanitizer.sanitize_input(content),
        "article_id": article_id,
        "token": token,
        "page": "comments",
    }

    response = requests.post(api_url, data=data, headers=headers)
    return response.status_code


def send_email(send_to, message, token):
    api_url = f"{my_domain_url}"
    data = {
        "message": Sanitizer.sanitize_input(message),
        "botcontrol": "",
        "email": send_to,
        "token": token,
        "sender": "AutoGenius Daily",
        "page": "email",
    }

    response = requests.post(api_url, data=data, headers=headers)
    return response.status_code


def login(email, password):
    api_url = f"{my_domain_url}"
    data = {
        "email": email,
        "password": password,
        "action": "login",
        "page": "users",
    }
    response = requests.post(api_url, data=data, headers=headers)
    if response.status_code == 200:
        return response.json()["token"]
    elif response.status_code == 404:
        print(response.status_code)
        exit()
    return None


def fetch_comments(token):
    api_url = f"{my_domain_url}?page=comments&token={token}"

    response = requests.get(api_url, headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        print(
            f"Error fetching unanswered comments. Status code: {response.status_code}"
        )
        return []


def fetch_emails(token):
    api_url = f"{my_domain_url}?page=email&token={token}"

    response = requests.get(api_url, headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error fetching unanswered emails. Status code: {response.status_code}")
        return []


def set_email_as_answered(email_id):
    api_url = f"{my_domain_url}?page=email&id={email_id}&token={token}"
    response = requests.get(api_url, headers=headers)

    if response.status_code == 200:
        print(
            f"Success set email {email_id} as answered. Status code: {response.status_code}"
        )
    else:
        print(
            f"Error set email {email_id} as answered. Status code: {response.status_code}"
        )


def create_post(token):
    for post_attempts in range(3):
        random_category = random.choice(categories)
        news_article = fetch_news(random_category)
        sources = [news_article["url"]] if news_article else []
        article = extract_article_content(news_article["url"])
        news_dict = {}
        for i, url in enumerate(sources):
            news_dict[f"news{i+1}"] = url
        sources_json = json.dumps(news_dict)

        if news_article:
            success = False
            while not success:
                try:
                    content = summarize_news(article)
                except RuntimeError as e:
                    print(f"Error occurred: {e}. Trying another article...")
                    break
                except ValueError as e:
                    print(f"Error occurred: {e}. Trying another article...")
                    break

                if not content:
                    print("Failed to summarize news. Trying again later...")
                    break

                short_content = summarize_article(article)
                if not short_content:
                    print("Failed to summarize article. Trying again later...")
                    break

                while True:
                    title = find_title(short_content)
                    if not title:
                        print("Failed to find title. Trying again later...")
                    elif len(title) > 255:
                        print("Title too long. Regenerating title...")
                    else:
                        break

                keywords = extract_keywords(content)
                if not keywords:
                    print("Failed to find keywords. Trying again later...")
                    break

                image_url = fetch_image_url(keywords)
                if not image_url:
                    print("Failed to find image. Trying again later...")
                    break

                status = send_to_api(
                    random_category,
                    title,
                    content,
                    image_url,
                    short_content,
                    sources_json,
                    token,
                )
                print(f"Article submitted with status code {status}")
                success = True
                return True

        else:
            print("Failed to fetch news. Try again later.")

    print("Failed to create a post after 3 attempts.")
    return False


if __name__ == "__main__":
    logging.debug("Script started")
    token = login(email, password)
    post_created = False

    while not post_created:
        post_created = create_post(token)

        if post_created:
            print("Post sent.")
        else:
            print("Failed to create a post after 3 attempts. Exiting...")
            break

    unanswered_comments = fetch_comments(token)

    if unanswered_comments:
        for article in unanswered_comments:
            article_id = article["id"]
            short_content = article["short_content"]
            comments = article["comments"]
            if comments != None:
                while True:
                    response = generate_response(short_content, comments)
                    if len(response) > 255:
                        print("Comment too long. Regenerating title...")
                    else:
                        break
                if response:
                    status = send_response(response, article_id, token)
                    print(
                        f"Comments for article { article_id } replied with status code {status}"
                    )
                else:
                    print(
                        f"Failed to generate response for comment of article { article_id }. Skipping."
                    )

    unanswered_emails = fetch_emails(token)

    if unanswered_emails:
        for unanswerd_email in unanswered_emails:
            email_id = unanswerd_email["id"]
            send_to = unanswerd_email["email_sender"]
            sender_message = unanswerd_email["message"]
            sender_username = unanswerd_email["sender"]
            response = generate_email_response(sender_username, sender_message)
            if response:
                status = send_email(send_to, response, token)
                print(
                    f"Response for email { email_id } replied with status code {status}"
                )
                if status == 200:
                    set_email_as_answered(email_id)
            else:
                print(f"Failed to generate response for email { email_id }. Skipping.")
    logging.debug("Script finished")
