from newspaper import Article
import requests
import random
from config import config
from collections import defaultdict


class ArticleUtils:
    _config = config

    @classmethod
    def extract_article_content(cls, url):
        cls._config.logger.debug("Extracting article content")
        article = Article(url)
        article.download()
        article.parse()
        return article.text

    @classmethod
    def summarize_article(cls, article, num_sentences=20):
        cls._config.logger.debug("Summarizing article")
        doc = cls._config.nlp(article)
        word_frequencies = defaultdict(int)
        for token in doc:
            if not token.is_stop and not token.is_punct:
                word_frequencies[token.text.lower()] += 1
        sentence_scores = defaultdict(int)
        for sentence in doc.sents:
            for token in sentence:
                sentence_scores[sentence] += word_frequencies[token.text.lower()]
        summarized_sentences = sorted(
            sentence_scores, key=sentence_scores.get, reverse=True
        )[:num_sentences]
        return " ".join([sent.text for sent in summarized_sentences])

    @classmethod
    def fetch_news(cls, category):
        try:
            cls._config.logger.debug("Fetching news")
            url = f"https://newsapi.org/v2/everything?q={category}&apiKey={cls._config.news_api_key}&language=fr"
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            articles_with_sources = []
            for article in data["articles"]:
                article_with_source = {"url": article["url"]}
                articles_with_sources.append(article_with_source)
            return (
                random.choice(articles_with_sources) if articles_with_sources else None
            )
        except requests.ConnectionError:
            return "Failed to connect to the server."
        except requests.Timeout:
            return "Request timed out."
        except requests.RequestException as error:
            return f"An error occurred while fetching the emails: {error}"
        except ValueError as ve:
            return str(ve)
