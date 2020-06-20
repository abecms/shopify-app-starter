import fs from "fs";
import path from "path";
import { encrypt, decrypt } from "../../utils/encryption";
import { getAsset, setAsset } from "../../server/shopify";
import * as db from "../../server/database";

export default async (req, res) => {
  const shopId = req.cookies.shopOrigin;
  console.log("shopId", shopId);

  const shop = await db.getItem({ store: shopId, sk: "settings" });
  //console.log("accessToken database", shop);

  let result = shop;

  res.status(200).json(shop);
};
