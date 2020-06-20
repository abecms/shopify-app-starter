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

# Install on an ECS server (AWS)

- Choisir une instance ECS
- une fois installée pour se connecter (avec la clé .pem qu'on a récupéré)
  ```
  ssh -i ~/.ssh/aws-mykey.pem ubuntu@url.eu-west-3.compute.amazonaws.com
  ```
- Installer une version de Node `https://github.com/nodesource/distributions/blob/master/README.md`
- Installer `n` pour gérer les versions de node et npm (changer les droits comme indiqué sur le github de n)
- installer la version désirée `n 12`
- Installer pm2 `npm i -g pm2`
- Le lancer au boot : `sudo pm2 startup`
- Installer un logrotate : `pm2 install pm2-logrotate`
- Créer une clé via `ssh-keygen` puis copier la clé publique dans les settings du projet github (deploy keys) et s'assurer d'avoir des URL de type `git@github.com:{user}/{repo}.git`
- Installer nginx
- Pour pouvoir avoir nginx en Reverse proxy sur NodeJS + Koa, il faut que la config du RP nginx contienne :
  `proxy_set_header X-Forwarded-Proto $scheme;`
  et que Koa dans server.js ait : `server.proxy = true;`

Ainsi, un setCookie secure sera bien positionné par Koa même s'il est en HTTP car il récupère la variable `X-Forwarded-Proto` qui contient HTTPS (il sait ainsi qu'il y a un reverse proxy en amont)
