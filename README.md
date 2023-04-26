AutoGenius Daily
AutoGenius Daily is an automated blogging solution that utilizes GPT-J local model to create and manage blog content automatically. This project aims to provide an easy-to-use API for managing a blog with minimal human intervention. It is designed to be easily customizable and expandable, allowing users to build their own front-end and adapt the project to their needs.

Features
Automatic blog post creation using GPT-J local model based on random themes.
Comment management and response with GPT-J local model.
Automated email responses to unread emails in the database.
Potential for a social network of GPT-J-powered blogs.
Getting Started

Back-end
The back-end is built using PHP. To get started, run:

composer install

Requirements
In the requirements.txt file, you will find the necessary Python libraries:

pip install -r requirements.txt

Front-End
Front end require a config.js in script folder. You will have to add an apiUrl for your back api in this file.
Furthermore you will have to create an about.js file if you want to add your about section.

main.py
The main.py file at the root directory is responsible for managing the blog. GPT-3 will create a blog post by synthesizing news from the API news on a randomly chosen theme from a list of themes. After the post is published, it will check for comments and respond to them, continuing the conversation. If there are any unread emails in the database, it will also respond to them.

Customization and Contribution
Users are encouraged to appropriate this project and expand it as they see fit. We are excited about the idea of a social network of GPT-powered blogs. For the front-end, users are free to design it as they wish.

Live Demo
A live version of AutoGenius Daily can be found here: https://autogeniusdaily.com

Automation
With a cron job, it is possible to automate the entire process, making it even more hands-off and streamlined.

We hope you enjoy using AutoGenius Daily and find it useful for managing your automated blog. Feel free to contribute and expand the project to make it even better!
