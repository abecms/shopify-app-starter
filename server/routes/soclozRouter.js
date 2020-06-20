import Router from "koa-router";
import koaBody from "koa-body";
import { createReadStream } from "fs";
import * as path from "path";
import { encrypt, decrypt } from "../../utils/encryption";
import * as fastmag from "../fastmag";
import * as shopify from "../shopify";
import * as services from "../services";
import * as socloz from "../socloz";
import * as db from "../database";
import _ from "lodash";
import dotenv from "dotenv";
import Bottleneck from "bottleneck";
import crypto from "crypto";

dotenv.config();
const { SHOP, S3BUCKET } = process.env;
const soclozRouter = new Router({ prefix: "/socloz" });

soclozRouter.get("/catalog", koaBody(), async (ctx) => {
  socloz.exportCatalog();

  ctx.body = {
    status: "success",
    result: `https://${S3BUCKET}.s3.eu-west-3.amazonaws.com/socloz.xml`,
  };
});

export default soclozRouter;
