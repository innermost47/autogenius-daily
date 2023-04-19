import requests
import random
import urllib.parse
import json
import os
from dotenv import load_dotenv
import html
from pyllamacpp.model import Model

load_dotenv()

news_api_key = os.environ.get("NEWS_API_KEY")
pixabay_api_key = os.environ.get("PIXABAY_API_KEY")
my_domain_url = os.environ.get("MY_DOMAIN_URL")
email = os.environ.get("EMAIL")
password = os.environ.get("PASSWORD")
referer = os.environ.get("REFERER")
your_model = os.environ.get("YOUR_MODEL")
pyllama_model = Model(ggml_model=your_model, n_ctx=2000)

headers = {
    'Referer': referer,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:97.0) Gecko/20100101 Firefox/97.0'
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
    url = f"https://pixabay.com/api/?key={pixabay_api_key}&q={urllib.parse.quote(query)}&image_type=photo"
    response = requests.get(url)
    data = response.json()

    if data["total"] > 0:
        random_image = random.choice(data["hits"])
        return random_image["webformatURL"]
    return None

def summarize_news(articles):
    text_to_summarize = " ".join(
        [
            article["title"]
            + (". " + article["description"] if article["description"] else "")
            for article in articles
        ]
    )

    prompt = (
        f"Please provide a large summary of the following news: {text_to_summarize}"
    )

    return pyllama_model.generate(prompt, n_predict=1800)

def summarize_article(article):
    prompt = (
        f"Please provide a short summary of the following news: {article}"
    )
    return pyllama_model.generate(prompt, n_predict=255)

def find_title(content):
    prompt = f"Please provide a concise title for the following article: {content}"
    return pyllama_model.generate(prompt, n_predict=20)

def find_image_key_word(content):
    prompt = f"Provide me with just one keyword related to the following article: {content}"
    return pyllama_model.generate(prompt, n_predict=20)

def generate_email_response(username, message):
    prompt = f"You are autoGenius, a news blog writer, {username} sent you this email: {message} via your blog, answer him on a professional way"
    return pyllama_model.generate(prompt, n_predict=400)

def generate_response(short_content, comments):
    prompt = f"[autoGenius]: '{short_content}'\n"

    for comment in comments:
        prompt += f"[{comment['username']}]: {comment['content']}\n"

    prompt += "[autoGenius]: "

    return pyllama_model.generate(prompt, n_predict=800)

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
        print(f"Error fetching unanswered comments. Status code: {response.status_code}")
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
        print(f"Success set email {email_id} as answered. Status code: {response.status_code}")
    else:
        print(f"Error set email {email_id} as answered. Status code: {response.status_code}")
    
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

                image_key_word = find_image_key_word(title)
                if not image_key_word:
                    print("Failed to find image key word.")
                    continue

                for image_attempts in range(3):
                    image_url = fetch_image_url(image_key_word)
                    if image_url:
                        break
                    print("Failed to fetch image url. Trying again later...")
                    image_key_word = find_image_key_word(title)

                if not image_url:
                    break

                print("All variables are valid.")
                status = send_to_api(random_category, title, content, image_url, short_content, sources_json, token)
                print(f"Article submitted with status code {status}")
                return True

            if not image_url:
                print("Failed to fetch image after 3 attempts. Trying a new post...")
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

    if(unanswered_comments) :
        for article in unanswered_comments:
            article_id = article["id"]
            short_content = article["short_content"]
            comments = article["comments"]
            if comments != None:
                response = generate_response(short_content, comments)
                if response:
                    status = send_response(response, article_id, token)
                    print(f"Comments for article { article_id } replied with status code {status}")
                else:
                    print(f"Failed to generate response for comment of article { article_id }. Skipping.")
                    
    unanswered_emails = fetch_emails(token)
    
    if(unanswered_emails):
        for unanswerd_email in unanswered_emails:
            email_id = unanswerd_email["id"]
            send_to = unanswerd_email["email_sender"]
            sender_message = unanswerd_email["message"]
            sender_username = unanswerd_email["sender"]
            response = generate_email_response(sender_username, sender_message)
            if response:
                status = send_email(send_to, response, token)
                print(f"Response for email { email_id } replied with status code {status}")
                if status == 200:
                    set_email_as_answered(email_id)
            else:
                print(f"Failed to generate response for email { email_id }. Skipping.")
        
             
