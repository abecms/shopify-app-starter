import fs from "fs";
import path from "path";
import { encrypt, decrypt } from "../../utils/encryption";
import { getAsset, setAsset } from "../../server/shopify";
import * as db from "../../server/database";

export default async (req, res) => {
  const shopId = req.cookies.shopOrigin;
  const shop = await db.getItem({ store: shopId, sk: "settings" });
  let response = {};

  if (shop.Item && shop.Item.fastmag) {
    response = shop.Item.fastmag;
  }

  res.status(200).json(response);
};
