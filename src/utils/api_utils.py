import requests
from config import config


class ApiUtils:
    _config = config

    @classmethod
    def send_to_api(
        cls, category, title, content, image_url, short_content, sources, token
    ):
        try:
            cls._config.logger.debug("Sending to api")
            api_url = f"{cls._config.api_url}"
            data = {
                "category": category,
                "title": title[:255],
                "short_content": short_content,
                "sources": sources,
                "content": content,
                "image_url": image_url,
                "token": token,
                "page": "articles",
            }
            response = requests.post(api_url, data=data, headers=cls._config.headers)
            response.raise_for_status()
        except requests.ConnectionError:
            return "Failed to connect to the server."
        except requests.Timeout:
            return "Request timed out."
        except requests.RequestException as error:
            return f"An error occurred while sending article: {error}"
        except ValueError as ve:
            return str(ve)

    @classmethod
    def send_response(cls, content, article_id, token):
        try:
            cls._config.logger.debug("Sending comment")
            api_url = f"{cls._config.api_url}"
            data = {
                "content": content,
                "article_id": article_id,
                "token": token,
                "page": "comments",
            }
            response = requests.post(api_url, data=data, headers=cls._config.headers)
            response.raise_for_status()
        except requests.ConnectionError:
            return "Failed to connect to the server."
        except requests.Timeout:
            return "Request timed out."
        except requests.RequestException as error:
            return f"An error occurred while sending comment: {error}"
        except ValueError as ve:
            return str(ve)

    @classmethod
    def send_email(cls, send_to, message, token):
        try:
            cls._config.logger.debug("Sending email")
            api_url = f"{cls._config.api_url}"
            data = {
                "message": message,
                "botcontrol": "",
                "email": send_to,
                "token": token,
                "sender": "AutoGenius Daily",
                "page": "email",
            }

            response = requests.post(api_url, data=data, headers=cls._config.headers)
            response.raise_for_status()
        except requests.ConnectionError:
            return "Failed to connect to the server."
        except requests.Timeout:
            return "Request timed out."
        except requests.RequestException as error:
            return f"An error occurred while sending email: {error}"
        except ValueError as ve:
            return str(ve)

    @classmethod
    def login(cls, email, password):
        try:
            cls._config.logger.debug("Logging in")
            api_url = f"{cls._config.api_url}"
            data = {
                "email": email,
                "password": password,
                "action": "login",
                "page": "users",
            }
            response = requests.post(api_url, data=data, headers=cls._config.headers)
            response.raise_for_status()
            res = response.json()
            cls._config.logger.debug("Logged successfully")
            return res["token"]
        except requests.ConnectionError:
            return "Failed to connect to the server."
        except requests.Timeout:
            return "Request timed out."
        except requests.RequestException as error:
            return f"An error occurred while trying to log: {error}"
        except ValueError as ve:
            return str(ve)

    @classmethod
    def fetch_comments(cls, token):
        try:
            config.logger.debug("Fetching comments")
            api_url = f"{cls._config.api_url}?page=comments&token={token}"
            response = requests.get(api_url, headers=cls._config.headers)
            response.raise_for_status()
            return response.json()
        except requests.ConnectionError:
            return "Failed to connect to the server."
        except requests.Timeout:
            return "Request timed out."
        except requests.RequestException as error:
            return f"An error occurred while fetching comments: {error}"
        except ValueError as ve:
            return str(ve)

    @classmethod
    def fetch_emails(cls, token):
        try:
            config.logger.debug("Fetching emails")
            api_url = f"{cls._config.api_url}?page=email&token={token}"
            response = requests.get(api_url, headers=cls._config.headers)
            response.raise_for_status()
            return response.json()
        except requests.ConnectionError:
            return "Failed to connect to the server."
        except requests.Timeout:
            return "Request timed out."
        except requests.RequestException as error:
            return f"An error occurred while fetching the emails: {error}"
        except ValueError as ve:
            return str(ve)

    @classmethod
    def set_email_as_answered(cls, email_id, token):
        try:
            cls._config.logger.debug("Setting email as answered")
            api_url = f"{cls._config.api_url}?page=email&id={email_id}&token={token}"
            response = requests.get(api_url, headers=cls._config.headers)
            response.raise_for_status()
        except requests.ConnectionError:
            return "Failed to connect to the server."
        except requests.Timeout:
            return "Request timed out."
        except requests.RequestException as error:
            return f"An error occurred while setting email as answered: {error}"
        except ValueError as ve:
            return str(ve)
