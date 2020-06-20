import dotenv from "dotenv";
import * as shopify from "../shopify";
import * as db from "../database";
import { Liquid } from "liquidjs";
dotenv.config();
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

const { SHOPIFY_API_SECRET, SHOP } = process.env;

export const sendMail = async (from, to, subject, template, changeset) => {
  const record = await db.getItem({ store: SHOP, sk: "settings" });
  let snippet = await shopify.getAsset(SHOP, record.Item.accessToken, template);
  //console.log('snippet', snippet)
  const engine = new Liquid();
  const tpl = engine.parse(snippet.asset.value);
  const html = await engine.render(tpl, changeset);
  //console.log('html', html)

  let mailOptions = {
    from: from,
    to: to,
    subject: subject,
    text: "",
    html: html,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Message sent: ", info);
    }
  });
};
