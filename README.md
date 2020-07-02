# Introduction
This starter is based on shopify-app-cli
Using the [Shopify-App-CLI](https://github.com/Shopify/shopify-app-cli)

The technos used are :
- Node
- Next.JS
- Koa
- React
- Polaris (Shopify)

# Features
- Create a Shopify app
- Create a Shopify custom app (for one customer)
- Create a Shopify Private app (it interacts with Shopify from outside of Shopify)
- CRON functions
- Mail functions
- Shopify API (REST + GraphQL) including pagination for REST and GraphQL + Bulk functions
- DynamoDB functions to persist store settings + data

# Installation
Clone the starter then npm i

## Develop
start the server
`PORT=8081 npm run dev`

Then open a tunnel with ngrok :
`ngrok http 8081 --subdomain=livingcolor`

# Build and deploy
Build the nextJS files
`npm run build`

# Create App on Shopify

Depending on the purpose of your app and how you’ll distribute or sell it, you first need to choose what type of app you’ll build. 

- [Create a public app](https://shopify.dev/tutorials/authenticate-a-public-app-with-oauth)
- [Create a custom app](https://shopify.dev/tutorials/authenticate-a-custom-app-with-oauth)
- [Create a private app](https://shopify.dev/tutorials/authenticate-a-private-app-with-shopify-admin)

# Install on an ECS server (AWS)

- Choose an ECS server on AWS
- once installed, get connect (with the .pem key given by AWS)
  ```
  ssh -i ~/.ssh/aws-mykey.pem ubuntu@url.eu-west-3.compute.amazonaws.com
  ```
- Install Node `https://github.com/nodesource/distributions/blob/master/README.md`
- Install `n` to manage versions of node and npm
- install the version you want `n 12`
- Install pm2 `npm i -g pm2`
- Launch pm2 on server boot : `sudo pm2 startup`
- Install a logrotate : `pm2 install pm2-logrotate`
- Create a key `ssh-keygen` then paste this key in the github project's settings (deploy keys) and be sure to have this type of url : `git@github.com:{user}/{repo}.git`
- Install nginx
- For nginx to work as a Reverse proxy on NodeJS + Koa, your nginx config must contain :
  `proxy_set_header X-Forwarded-Proto $scheme;`
  Koa in server.js : `server.proxy = true;`

This way a setCookie `secure` will be well served by Koa even if your server is in HTTP (bc it checks `X-Forwarded-Proto` which contains https

