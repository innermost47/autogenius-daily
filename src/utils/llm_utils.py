from config import config


class LlmUtils:
    _config = config

    @classmethod
    def generate_prompt(cls, instruction, input):
        return f"""<|system|>
Below is a conversation between a user and an AI assistant named Zephyr.
Zephyr is polite, emotionally aware, humble-but-knowledgeable, always providing helpful and detailed answers.
Zephyr is skilled in responding proficiently in the languages its users use and can perform a wide range of tasks such as text editing, translation, question answering, logical reasoning, coding, and many others.
Zephyr cannot receive or generate audio or visual content and cannot access the internet.
Zephyr strictly avoids discussing sensitive, offensive, illegal, ethical, or political topics and caveats when unsure of the answer.
</s>
<|user|>
{instruction} "{input}"</s>
<|assistant|>
"""

    @classmethod
    def generate(cls, instruction, input, max_tokens):
        prompt = cls.generate_prompt(instruction=instruction, input=input)
        result = cls._config.llm(
            prompt=prompt,
            max_tokens=max_tokens,
            stop=[
                "<|user|>",
                "<|assistant|>",
                "</s>",
            ],
        )
        return result["choices"][0]["text"]

    @classmethod
    def summarize_news(cls, article):
        cls._config.logger.debug("Summarizing news")
        prompt = "Fournissez un large résumé en français et dans un style journalistique de l'article d'actualité suivant, tout en vous assurant que les faits sont représentés avec précision : "
        response = cls.generate(prompt, article, 2048)
        if response.startswith(prompt):
            response = response[len(prompt) :].strip(' "')
        return response.strip()

    @classmethod
    def summarize_article(cls, article):
        cls._config.logger.debug("Summarizing article for description")
        prompt = "Fournissez un résumé concis en français et dans un style journalistique de l'article d'actualité suivant, tout en vous assurant que les faits sont représentés avec précision : "
        response = cls.generate(prompt, article, 1024)
        if response.startswith(prompt):
            response = response[len(prompt) :].strip(' "')
        return response.strip()

    @classmethod
    def find_title(cls, content):
        cls._config.logger.debug("Finding title")
        prompt = "Générez un titre concis en français et dans un style journalistique pour l'article d'actualité suivant : "
        response = cls.generate(prompt, content, 128)
        if response.startswith(prompt):
            response = response[len(prompt) :].strip(' "').replace('"', "")
        return response.strip()

    @classmethod
    def generate_email_response(cls, username, message, email_id):
        cls._config.logger.debug(f"Generating answer for email {email_id}")
        prompt = f"{username} vous a envoyé cet email via votre blog, répondez-lui de manière professionnelle"
        response = cls.generate(prompt, message, 2048)
        if response.startswith(prompt):
            response = response[len(prompt) :].strip(' "')
        return response.strip()

    @classmethod
    def generate_response(cls, short_content, comments, article_id):
        cls._config.logger.debug(f"Generating comment for article {article_id}")
        instruction = "Continue"
        prompt = f"@autoGenius: '{short_content}'\n"
        for comment in comments:
            prompt += f"@{comment['username']}: {comment['content']}\n"
        name = "@autoGenius:"
        prompt += name + " "
        response = cls.generate(instruction, prompt, 256)
        if response.startswith(instruction):
            response = response[len(instruction) :].strip(' "')
        return response.strip()

    @classmethod
    def extract_keywords(cls, content):
        cls._config.logger.debug("Extracting keyword for image")
        prompt = "Résumez en un seul mot : "
        response = cls.generate(prompt, content, 64)
        if response.startswith(prompt):
            response = response[len(prompt) :].strip(' "')
        return response.strip()
