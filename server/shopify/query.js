import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";
import _ from "lodash";
import fs from "fs";
import readline from "readline";

dotenv.config();

const {
  SHOPIFY_PRIVATE_API_KEY,
  SHOPIFY_PRIVATE_API_PASSWORD,
  SHOP,
} = process.env;

export const getUrl = (activeShop = null, accessToken = null) => {
  if (accessToken) {
    return `https://${activeShop}/admin/api/2020-04`;
  }

  return `https://${SHOPIFY_PRIVATE_API_KEY}:${SHOPIFY_PRIVATE_API_PASSWORD}@${SHOP}/admin/api/2020-04`;
};

export const getHeaders = (accessToken = null) => {
  if (accessToken) {
    return { "X-Shopify-Access-Token": accessToken };
  }

  return {};
};

export const getNextPage = (headers) => {
  let m;
  let nextPage = "";
  const regex = new RegExp(`<([^>]*)>; rel="next"`, "g");

  while ((m = regex.exec(headers.link)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }

    // The result can be accessed through the `m`-variable.
    m.forEach((match, groupIndex) => {
      if (groupIndex === 1) {
        nextPage = match;
      }
    });
  }

  if (nextPage != "") {
    nextPage = `${getUrl()}/${nextPage.split("?")[0].split("/").pop()}?${
      nextPage.split("?")[1]
    }`;
  }

  //console.log('nextPage', nextPage)
  return nextPage;
};

export const getPreviousPage = (headers) => {
  let m;
  let previousPage = "";
  const regex = new RegExp(`<([^>]*)>; rel="previous"`, "g");

  while ((m = regex.exec(headers.link)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }

    // The result can be accessed through the `m`-variable.
    m.forEach((match, groupIndex) => {
      if (groupIndex === 1) {
        previousPage = match;
      }
    });
  }
  if (previousPage != "") {
    previousPage = `${getUrl()}/${previousPage
      .split("?")[0]
      .split("/")
      .pop()}?${previousPage.split("?")[1]}`;
  }

  return previousPage;
};

export const verifyShopifyHook = (ctx) => {
  const { headers, request } = ctx;
  const { "x-shopify-hmac-sha256": hmac } = headers;
  const { rawBody } = request;

  const digest = crypto
    .createHmac("SHA256", process.env.SHOPIFY_PRIVATE_API_KEY)
    .update(new Buffer(rawBody, "utf8"))
    .digest("base64");

  return safeCompare(digest, hmac);
};
