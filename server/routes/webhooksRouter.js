import Router from "koa-router";
import { receiveWebhook, registerWebhook } from "@shopify/koa-shopify-webhooks";
import axios from "axios";
import * as fastmag from "../fastmag";
import * as shopify from "../shopify";
import * as db from "../database";
import _ from "lodash";
import { Liquid } from "liquidjs";

const nodemailer = require("nodemailer");
const AWS = require("aws-sdk");

AWS.config.update({
  region: "eu-west-1",
});

let transporter = nodemailer.createTransport({
  SES: new AWS.SES({
    apiVersion: "2010-12-01",
  }),
});

const { EMAIL_FROM, SHOPIFY_API_SECRET, SHOP } = process.env;
const webhook = receiveWebhook({ secret: SHOPIFY_API_SECRET });
const webhooksRouter = new Router({ prefix: "/webhook" });

/**
 *
 */
webhooksRouter.post("/orders/create", webhook, async (ctx) => {
  let success = true;
  const order = ctx.request.body;
  if (
    order.processed_at.split("T")[0] < "2020-06-16" &&
    SHOP === "izac-shop.myshopify.com"
  ) {
    console.log("ancienne commande");
    ctx.body = {
      status: "success",
      result: "ok",
    };

    return true;
  }
  const orderMetafields = await shopify.getOrderMetafields(order.id);

  console.log("commande reçue", order.id);
  //console.log('order', order)
  //console.log('orderMetafields', orderMetafields)

  const alreadyProcessed = orderMetafields.some(
    (item) => item["key"] === "fastmag-order-id"
  );

  //console.log("alreadyProcessed", alreadyProcessed);

  // console.log("received webhook: ", ctx.state.webhook);
  // console.log("order received:", order);
  // console.log("line_items", order.line_items);

  if (!alreadyProcessed) {
    /**
     * It seems in some circumstances the Fastmag Order has been created but
     * we've sent a refusal to the Shopify order
     * These lines help us to check if a Fastmag order exist already
     * If yes, we then send an acknowledgment to Shopify and stop the process
     */
    const existingFastmagOrder = await fastmag.getOrderByShopifyIds(
      SHOP,
      `('${order.name}')`
    );
    if (_.isEmpty(existingFastmagOrder)) {
      success = await fastmag.createOrder(SHOP, order);
    } else {
      // An order has been created in Fastmag but the fastmag order ID
      // is not present in Shopify. I update shopify with orderId
      const changeset = {
        metafields: [
          {
            key: "fastmag-order-id",
            value: Object.keys(existingFastmagOrder)[0],
            value_type: "string",
            namespace: "global",
          },
        ],
      };
      await shopify.updateOrder(order.id, changeset);
    }
  }

  if (success) {
    ctx.body = {
      status: "success",
      result: "ok",
    };
  } else {
    ctx.status = 422;
    ctx.throw(422, "Invalid order creation");
  }
});

/**
 *
 */
webhooksRouter.post("/customers/create", webhook, async (ctx) => {
  const customer = ctx.request.body;
  //console.log("customer create", customer);
  console.log("customer created", customer.id);

  if (customer.accepts_marketing && customer.tags === "newsletter") {
    const record = await db.getItem({ store: SHOP, sk: "settings" });

    const shop = {
      email_logo_url:
        "https://www.izac.fr/skin/frontend/rwd/default/images/logo-izac-blason.png",
      email_logo_width: "200",
      email_accent_color: "#000",
      name: "Izac",
      url: `https://${SHOP}`,
    };
    let snippet = await shopify.getAsset(
      SHOP,
      record.Item.accessToken,
      "snippets/email.newsletter-confirmation.liquid"
    );
    //console.log('snippet', snippet)
    const engine = new Liquid();
    const tpl = engine.parse(snippet.asset.value);
    const html = await engine.render(tpl, { customer: customer, shop: shop });
    //console.log('EMAIL_FROM', EMAIL_FROM)
    // send welcome email
    let mailOptions = {
      from: `${EMAIL_FROM}`,
      to: customer.email,
      subject: "Newsletter subscription ✔",
      text: "Welcome aboard !",
      html: html,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        db.log(SHOP, "newsletter-mail", {
          success: false,
          email: customer.email,
        });
        console.log(error);
      } else {
        db.log(SHOP, "newsletter-mail", {
          success: true,
          email: customer.email,
        });
      }
    });
  }

  ctx.body = {
    status: "success",
    result: "ok",
  };
});

/**
 *
 */
webhooksRouter.post("/customers/update", webhook, async (ctx) => {
  const customer = ctx.request.body;
  console.log("customer updated", customer.id);

  ctx.body = {
    status: "success",
    result: "ok",
  };
});

export default webhooksRouter;
