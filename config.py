import os
from dotenv import load_dotenv
from llama_cpp import Llama
import logging
import spacy
import sys

load_dotenv()


class Configuration:
    _instance = None

    def __new__(cls):
        if not cls._instance:
            cls._instance = super(Configuration, cls).__new__(cls)
            cls._instance.init_variables()
            cls._instance.init_model()
            cls._instance.init_misc()
            cls._instance.init_logger()
        return cls._instance

    def init_variables(self):
        self.news_api_key = os.environ.get("NEWS_API_KEY")
        self.pexels_api_key = os.environ.get("PEXELS_API_KEY")
        self.api_url = os.environ.get("API_URL")
        self.email = os.environ.get("EMAIL")
        self.password = os.environ.get("PASSWORD")
        self.model = os.environ.get("MODEL")

    def init_model(self):
        self.llm = Llama(
            model_path=self.model,
            n_ctx=4000,
        )
        model_path = os.path.join(sys._MEIPASS, 'fr_core_news_sm')
        self.nlp = spacy.load(model_path)

    def init_misc(self):
        self.headers = {
            "Referer": "http://www.google.com",
            "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:90.0) Gecko/20100101 Firefox/90.0",
        }
        self.categories = [
            "business",
            "entertainment",
            "general",
            "health",
            "science",
            "sports",
            "technology",
        ]

    def init_logger(self):
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.DEBUG)

        formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")

        file_handler = logging.FileHandler(os.environ.get("LOG_FILE"))
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(formatter)
        self.logger.addHandler(file_handler)

        stream_handler = logging.StreamHandler()
        stream_handler.setLevel(logging.DEBUG)
        stream_handler.setFormatter(formatter)
        self.logger.addHandler(stream_handler)


config = Configuration()
