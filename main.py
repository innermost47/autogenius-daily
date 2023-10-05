import random
import json
from config import config
from src.utils.api_utils import ApiUtils
from src.utils.images_utils import ImagesUtils
from src.utils.article_utils import ArticleUtils
from src.utils.llm_utils import LlmUtils


def create_post(token):
    config.logger.debug("Creating post")
    random_category = random.choice(config.categories)
    news_article = ArticleUtils.fetch_news(random_category)
    sources = [news_article["url"]] if news_article else []
    article = ArticleUtils.extract_article_content(news_article["url"])
    article = ArticleUtils.summarize_article(article)
    news_dict = {}
    for i, url in enumerate(sources):
        news_dict[f"news{i+1}"] = url
    sources_json = json.dumps(news_dict)
    content = LlmUtils.summarize_news(article)
    short_content = LlmUtils.summarize_article(article)
    title = LlmUtils.find_title(short_content)
    keywords = LlmUtils.extract_keywords(content)
    image_url = ImagesUtils.fetch_image_url(keywords)
    ApiUtils.send_to_api(
        random_category,
        title,
        content,
        image_url,
        short_content,
        sources_json,
        token,
    )


def answer_comments(token):
    unanswered_comments = ApiUtils.fetch_comments(token)
    if isinstance(unanswered_comments, str):
        config.logger.error(f"Error fetching comments: {unanswered_comments}")
        return
    if unanswered_comments:
        for article in unanswered_comments:
            article_id = article["id"]
            short_content = article["short_content"]
            comments = article["comments"]
            if comments != None:
                comment = LlmUtils.generate_response(
                    short_content, comments, article_id
                )
                ApiUtils.send_response(comment, article_id, token)
    config.logger.debug("There are no comments to answer to")


def answer_emails(token):
    unanswered_emails = ApiUtils.fetch_emails(token)
    if isinstance(unanswered_emails, str):
        config.logger.error(f"Error fetching emails: {unanswered_emails}")
        return
    if unanswered_emails:
        for unanswerd_email in unanswered_emails:
            email_id = unanswerd_email["id"]
            send_to = unanswerd_email["email_sender"]
            sender_message = unanswerd_email["message"]
            sender_username = unanswerd_email["sender"]
            response = LlmUtils.generate_email_response(
                sender_username, sender_message, email_id
            )
            ApiUtils.send_email(send_to, response, token)
            ApiUtils.set_email_as_answered(email_id, token)
    config.logger.debug("There are no emails to answer to")


def main():
    config.logger.debug("Script started")
    token = ApiUtils.login(config.email, config.password)
    create_post(token)
    answer_comments(token)
    answer_emails(token)
    config.logger.debug("Script finished")


if __name__ == "__main__":
    main()
