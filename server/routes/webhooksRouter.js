import Router from "koa-router";
import { receiveWebhook, registerWebhook } from "@shopify/koa-shopify-webhooks";
import axios from "axios";
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
  ctx.body = {
    status: "success",
    result: "ok",
  };
});

/**
 *
 */
webhooksRouter.post("/customers/create", webhook, async (ctx) => {
  const customer = ctx.request.body;

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

  ctx.body = {
    status: "success",
    result: "ok",
  };
});

export default webhooksRouter;
