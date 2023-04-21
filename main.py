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

load_dotenv()

news_api_key = os.environ.get("NEWS_API_KEY")
pexels_api_key = os.environ.get("PEXELS_API_KEY")
my_domain_url = os.environ.get("MY_DOMAIN_URL")
email = os.environ.get("EMAIL")
password = os.environ.get("PASSWORD")
referer = os.environ.get("REFERER")
your_model = os.environ.get("YOUR_MODEL")

headers = {
    "Referer": referer,
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:97.0) Gecko/20100101 Firefox/97.0",
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

ins = """### Instruction:
{}
### Response:
"""


def generate(instruction):
    result = ""
    for x in llm(
        ins.format(instruction),
        stop=["### Instruction:", "### End"],
        stream=True,
        max_tokens=1200,
    ):
        result += x["choices"][0]["text"]
    return result


def clean_text(text):
    return "".join(
        c
        for c in unicodedata.normalize("NFKD", text)
        if unicodedata.category(c) != "Mn"
    )


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

        return articles_with_sources

    return []


def fetch_image_url(query):
    pexels_headers = {"Authorization": pexels_api_key}
    url = f"https://api.pexels.com/v1/search?query={urllib.parse.quote(query)}&per_page=1&page=1"
    try:
        response = requests.get(url, headers=pexels_headers)
        response.raise_for_status()

        try:
            json_data = response.json()
            image_url = json_data["photos"][0]["src"]["original"]
        except JSONDecodeError:
            print(f"Invalid JSON response from {url}")
            return None
        return image_url

    except requests.exceptions.RequestException as e:
        print(f"An error occurred while making a request to {url}: {e}")
        return None


def summarize_news(articles):
    text_to_summarize = " ".join(
        [
            article["title"]
            + (". " + article["description"] if article["description"] else "")
            for article in articles
        ]
    )

    prompt = f"Summurize these news in one text: {text_to_summarize}"

    response = generate(clean_text(prompt))
    print(response)
    return response


def summarize_article(article):
    prompt = f"Summurize: {article}"
    response = generate(clean_text(prompt))
    print(response)
    return response


def find_title(content):
    prompt = f"Give a very concise title wich describe this: {content}"
    response = generate(clean_text(prompt))
    print(response)
    return response


def generate_email_response(username, message):
    prompt = f"You are autoGenius, a news blog writer, {username} sent you this email: {message} via your blog, answer him on a professional way"
    response = generate(clean_text(prompt))
    print(response)
    return response


def generate_response(short_content, comments):
    prompt = f"[autoGenius]: '{short_content}'\n"

    for comment in comments:
        prompt += f"[{comment['username']}]: {comment['content']}\n"

    prompt += "[autoGenius]: "

    response = generate(clean_text(prompt))
    print(response)
    return response


def extract_keywords(content):
    prompt = f"Summerize in only one word: {content}"
    response = generate(clean_text(prompt))
    print(response)
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
        "bot-control": "",
        "email": send_to,
        "token": token,
        "page": "comments",
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
        news_articles = fetch_news(random_category)
        sources = [article["url"] for article in news_articles[:3]]
        news_dict = {}
        for i, url in enumerate(sources):
            news_dict[f"news{i+1}"] = url
        sources_json = json.dumps(news_dict)

        if news_articles:
            while True:
                content = summarize_news(news_articles)
                if not content:
                    print("Failed to summarize news. Trying again later...")
                    continue

                title = find_title(content)
                if not title:
                    print("Failed to find title. Trying again later...")
                    continue

                short_content = summarize_article(content)
                if not short_content:
                    print("Failed to summarize article. Trying again later...")
                    continue

                keywords = extract_keywords(content)
                if not keywords:
                    print("Failed to find keywords. Trying again later...")
                    continue

                image_url = fetch_image_url(keywords)

                print(
                    title, image_url, short_content, sources_json, content, sep="\n\n"
                )
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
                return True

        else:
            print("Failed to fetch news. Try again later.")

    print("Failed to create a post after 3 attempts.")
    return False


if __name__ == "__main__":
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
                response = generate_response(short_content, comments)
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
