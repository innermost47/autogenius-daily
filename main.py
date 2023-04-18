import requests
import openai
import random
from bs4 import BeautifulSoup
from PIL import Image
from io import BytesIO
import urllib.parse
import json
import os
from dotenv import load_dotenv

load_dotenv()

openai.api_key = os.environ.get("OPENAI_API_KEY")
news_api_key = os.environ.get("NEWS_API_KEY")
pixabay_api_key = os.environ.get("PIXABAY_API_KEY")
my_domain_url = os.environ.get("MY_DOMAIN_URL")
email = os.environ.get("EMAIL")
password = os.environ.get("PASSWORD")

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
    response = openai.Completion.create(
        engine="text-davinci-002",
        prompt=prompt,
        max_tokens=1800,
        n=1,
        stop=None,
        temperature=0.7,
    )

    return response.choices[0].text.strip()

def summarize_article(article):
    prompt = (
        f"Please provide a short summary of the following news: {article}"
    )
    response = openai.Completion.create(
        engine="text-davinci-002",
        prompt=prompt,
        max_tokens=255,
        n=1,
        stop=None,
        temperature=0.7,
    )

    return response.choices[0].text.strip()


def find_title(content):
    prompt = f"Please provide a concise title for the following article: {content}"
    response = openai.Completion.create(
        engine="text-davinci-002",
        prompt=prompt,
        max_tokens=20,
        n=1,
        stop=None,
        temperature=0.7,
    )

    return response.choices[0].text.strip()


def find_image_key_word(content):
    prompt = f"Provide me with just one keyword related to the following article: {content}"
    response = openai.Completion.create(
        engine="text-davinci-002",
        prompt=prompt,
        max_tokens=20,
        n=1,
        stop=None,
        temperature=0.7,
    )

    return response.choices[0].text.strip()

def generate_response(short_content, comments):
    prompt = f"Please provide a thoughtful and relevant response to the following comment: '{short_content}'.\n\nKeep in mind that you are the writer of this article. {len(comments)} comments have been made on this article so far.\n\n"

    for comment in comments:
        prompt += f"[{comment['username']}]: {comment['content']}\n"

    prompt += "\n[You]: "

    response = openai.Completion.create(
        engine="text-davinci-002",
        prompt=prompt,
        max_tokens=800,
        n=1,
        stop=None,
        temperature=0.7,
    )

    return response.choices[0].text.strip()


def send_to_api(category, title, content, image_url, short_content, sources, token):
    api_url = f"{my_domain_url}"
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
    response = requests.post(api_url, data=data)
    return response.status_code

def send_response(content, article_id, token):
    api_url = f"{my_domain_url}"
    data = {
        "content": content,
        "article_id": article_id,
        "token": token,
        "page": "comments",
    }

    response = requests.post(api_url, data=data)
    return response.status_code


def login(email, password):
    api_url = f"{my_domain_url}"
    data = {
        "email": email,
        "password": password,
        "action": "login",
        "page": "users",
    }
    response = requests.post(api_url, data=data)

    if response.status_code == 200:
        return response.json()["token"]
    return None


def fetch_comments(token):
    api_url = f"{my_domain_url}?page=comments&token={token}"

    response = requests.get(api_url)

    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error fetching unanswered comments. Status code: {response.status_code}")
        return []
    
def create_post(token) :
    random_category = random.choice(categories)
    news_articles = fetch_news(random_category)
    sources = [article["url"] for article in news_articles[:3]]
    news_dict = {}
    for i, url in enumerate(sources):
        news_dict[f"news{i+1}"] = url
    sources_json = json.dumps(news_dict)
    if news_articles :
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

            while True:
                image_url = fetch_image_url(image_key_word)
                if not image_url:
                    print("Failed to fetch image url. Trying again later...")
                    image_key_word = find_image_key_word(title)
                    image_url = fetch_image_url(image_key_word)
                    continue
                break
            break

        print("All variables are valid.")
        status = send_to_api(random_category, title, content, image_url, short_content, sources_json, token)
        print(f"Article submitted with status code {status}")
        return True;  
    else:
        print("Failed to fetch news. Try again later.")
    

if __name__ == "__main__":
    token = login(email, password)
    post_created = False
    while not post_created:
        post_created = create_post(token)

        if post_created:
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
