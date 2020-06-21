import "@babel/polyfill";
import dotenv from "dotenv";
import "isomorphic-fetch";
import createShopifyAuth, { verifyRequest } from "@shopify/koa-shopify-auth";
import graphQLProxy, { ApiVersion } from "@shopify/koa-shopify-graphql-proxy";
import { receiveWebhook, registerWebhook } from "@shopify/koa-shopify-webhooks";
import Koa from "koa";
import next from "next";
import Router from "koa-router";
import session from "koa-session";
import _ from "lodash";
import * as handlers from "./handlers/index";
import apiRouter from "./routes/apiRouter";
import cors from "koa2-cors";
import * as db from "./database";
import * as cron from "./cron";

// we authorize Ajax calls to unverified CERTS
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

dotenv.config();
const port = parseInt(process.env.PORT, 10) || 8081;
const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev,
});
const handle = app.getRequestHandler();
const { SHOPIFY_API_SECRET, SHOPIFY_API_KEY, SCOPES, DATABASE } = process.env;
cron.init();

app.prepare().then(() => {
  const server = new Koa();
  server.proxy = true;
  const router = new Router();
  server.use(cors());
  server.use(
    session(
      {
        sameSite: "none",
        secure: true,
      },
      server
    )
  );
  server.keys = [SHOPIFY_API_SECRET];
  server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET,
      scopes: [SCOPES],
      accessMode: "offline",
      async afterAuth(ctx) {
        //Auth token and shop available in session
        //Redirect to shop upon auth
        const { shop, accessToken } = ctx.session;

        await db.createTable();
        let item = await db.getItem({ store: shop, sk: "settings" });

        if (!item || _.isEmpty(item)) {
          await db.addItem({
            store: shop,
            sk: "settings",
            accessToken: accessToken,
          });
        } else if (item.Item.accessToken !== accessToken) {
          const key = { store: shop, sk: "settings" };

          var changeset = {
            UpdateExpression: "set #token = :x",
            ExpressionAttributeNames: { "#token": "accessToken" },
            ExpressionAttributeValues: { ":x": accessToken },
          };

          await db.updateItem(key, changeset);
        }

        ctx.cookies.set("shopOrigin", shop, {
          httpOnly: false,
          secure: true,
          sameSite: "none",
        });

        const registration = await registerWebhook({
          address: `https://${ctx.hostname}/app/webhook/orders/create`,
          topic: "ORDERS_CREATE",
          accessToken,
          shop,
          apiVersion: ApiVersion.October19,
        });

        if (registration.success) {
          console.log("Successfully registered ORDERS_CREATE webhook!");
        } else {
          console.log(
            "Failed to register ORDERS_CREATE webhook",
            registration.result
          );
        }
        const customerCreate = await registerWebhook({
          address: `https://${ctx.hostname}/app/webhook/customers/create`,
          topic: "CUSTOMERS_CREATE",
          accessToken,
          shop,
          apiVersion: ApiVersion.October19,
        });

        if (customerCreate.success) {
          console.log("Successfully registered CUSTOMERS_CREATE webhook!");
        } else {
          console.log(
            "Failed to register CUSTOMERS_CREATE webhook",
            customerCreate.result
          );
        }
        const customerUpdate = await registerWebhook({
          address: `https://${ctx.hostname}/app/webhook/customers/update`,
          topic: "CUSTOMERS_UPDATE",
          accessToken,
          shop,
          apiVersion: ApiVersion.October19,
        });

        if (customerUpdate.success) {
          console.log("Successfully registered CUSTOMERS_UPDATE webhook!");
        } else {
          console.log(
            "Failed to register CUSTOMERS_UPDATE webhook",
            customerUpdate.result
          );
        }
        ctx.redirect("/");
      },
    })
  );
  server.use(
    graphQLProxy({
      version: ApiVersion.October19,
    })
  );
  //server.use(verifyRequest())
  server.use(apiRouter.routes(), apiRouter.allowedMethods());

  router.get("(.*)", verifyRequest(), async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  });
  server.use(router.allowedMethods());
  server.use(router.routes());
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
