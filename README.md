# MessengerBot

# Try Live Bot

You can try this bot live on heroku server. But you have to login to Facebook using this testing bout account.

visit this website

```sh
https://messenger-bot-tech-test.herokuapp.com/
```

and log in to facebook using this account:

```sh
email : cobapringles@gmail.com
pass  : pringlesmantap
```

## Introduction

This is my first project on building a Messenger Bot. I use [NodeJS](https://nodejs.org/en/) as a main technology, the server is using [ExpressJS](https://expressjs.com/), and [MongoDB] as the Databses.

## Functionality

This app can compute how many days until the users next birthday as the output. This app input is text message. 

This app also has RestAPI endpoint.
| NO | Method | API | Function description|
| --- | --- | --- | --- |
| 1 | GET | "/messages" | it will return all the messages history on the conversation |
| 2 | GET | "/messages/:id" | it will return specific message by the id|
| 3| GET | "/messages/sender/::sender_psid" | it will return all message history by sender id |
| 4 | DELETE | "messages/:id" | it will delete specific chat history by id |


## Configuration

### Install Dependecies

```sh
npm install --save express dotenv ejs body-parser moment request
```
```sh
npm install --save-dev nodemon babel-cli babel-preset-env 
```



### ".env" file
you need to put some important value, so that the application can run on your web
1. PORT
2. VERIFY_TOKEN -> fill whatever you want
3. FACEBOOK_PAGE_TOKEN -> get this token  from following the step on next section
4. DB_CONNECTION -> fill this with your MongoDB database link


## How To Deploy 

1. Clone this repo
2. Create Page on your Facebook
3. Create Facebook For Developer Account
4. Create new Apps on Facebook For Developer Account
5. Add Messenger Product on your Facebook For Developer App
6. Opeen Messenger Product Settings > Access Token > Add Pages that was created on step 2
7. On access token section, Generate Token and paste it to FACEBOOK_PAGE_TOKEN variable om .env file
8. Deploy this repo on any deployment platform and then copy the link
9. On Webhook section, Paste the link on Messenger Product Settings > Webhooks > Callback URL
10. On Webhook section, Fill verify token textbox with VERIFY_TOKEN at .env file
11. On Webhook section, Check all Facebook page Subscription
12. On the Built-In-NLP section, add the page that created on step 2
13. On your deployment platform, open your app setting
14. Go to app setting and then add .env variable to your app config variable 
15. This bot is ready to run
16. Open your facebook page and click "add action button"
17. Choose "send message"
18. start chatting with the bot