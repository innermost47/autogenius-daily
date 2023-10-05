import requests
import urllib.parse
from config import config


class ImagesUtils:
    _config = config

    @classmethod
    def fetch_image_url(cls, query):
        cls._config.logger.debug("Fetching image")
        pexels_headers = {"Authorization": cls._config.pexels_api_key}
        url = f"https://api.pexels.com/v1/search?query={urllib.parse.quote(query)}&per_page=1&page=1"
        try:
            response = requests.get(url, headers=pexels_headers)
            response.raise_for_status()
            try:
                json_data = response.json()
                image_url = json_data["photos"][0]["src"]["large"]
                return image_url
            except requests.exceptions.JSONDecodeError:
                raise ValueError(f"Invalid JSON response from {url}")
        except requests.ConnectionError:
            return "Failed to connect to the server."
        except requests.Timeout:
            return "Request timed out."
        except requests.RequestException as error:
            return f"An error occurred while fetching image: {error}"
        except ValueError as ve:
            return str(ve)
