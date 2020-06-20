import * as shopify from "../shopify";
import dotenv from "dotenv";
import _ from "lodash";
import fs from "fs";
import * as db from "../database";

const AWS = require("aws-sdk");
AWS.config.update({
  region: "eu-west-3",
});
const s3 = new AWS.S3();

dotenv.config();
const { SHOP, S3BUCKET } = process.env;

export const exportCatalog = async () => {
  const service = await shopify.getFulfillmentServiceByName("fastmag");
  const locationId = _.get(service, "location_id", null);
  const shopifyInventory = await shopify.getFullCatalog(locationId);

  const products = parseResults(shopifyInventory);
  //console.log('products', products);

  const xmlProducts = [];
  let xml = `<?xml version="1.0" encoding="UTF-8" ?><products>`;

  for (const key in products) {
    const product = products[key];
    //console.log('product', product);

    product["variants"].map((variant) => {
      if (_.get(variant, "sku") && _.get(product, "onlineStoreUrl")) {
        //console.log("variant", variant);

        let color = "";
        let reference = "";
        let linkedSku = "";
        product.tags.map((tag) => {
          if (tag.startsWith("color_")) {
            color = tag.replace("color_", "");
          }
          if (tag.startsWith("reference_")) {
            reference = tag.replace("reference_", "");
          }
        });
        const productId = _.get(variant, "sku")
          .replace(/\|/g, "_")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/ /g, "-");
        const fastmagId = _.get(variant, "fastmagId.value");
        const retailPrice = variant.compareAtPrice ? variant.compareAtPrice : 0;
        const discount = _.get(variant, "compareAtPrice")
          ? Math.round(
              100 -
                (variant.price / _.get(variant, "compareAtPrice")) * 100 * 100
            ) / 100
          : 0;
        const collections = _.get(product, "collections");
        let collectionsStr = "";
        if (collections) {
          let i = 1;
          collections.map((collection) => {
            //console.log('collection', collection);
            if (!_.get(collection, "title").startsWith("Group_")) {
              collectionsStr += `<categoryid${i}><![CDATA[${_.get(
                collection,
                "title"
              )}]]></categoryid${i}>`;
              i++;
            }
          });
        }

        const xmlProduct = `<product id='${productId}'>
          <product.type>simple</product.type>
          <sku.groupId>${reference}</sku.groupId>
          <sku.attributes.size>${_.get(
            variant,
            "selectedOptions[0].value"
          )}</sku.attributes.size>
          <sku.attributes.color>${color}</sku.attributes.color>
          <sku.ean>${_.get(variant, "barcode")}</sku.ean>
          <fastmag.id>${fastmagId}</fastmag.id>
          <name><![CDATA[${_.get(product, "title")}]]></name>
          <producturl>${_.get(product, "onlineStoreUrl")}</producturl>
          <bigimage>${_.get(product, "featuredImage.originalSrc")}</bigimage>
          <description><![CDATA[${_.get(
            product,
            "description"
          )}]]></description>
          <price>${variant.price}</price>
          <retailprice>${retailPrice}</retailprice>
          <discount>${discount}</discount>
          ${collectionsStr}
          </product>`;

        xmlProducts.push(xmlProduct);
      }
    });
  }

  const xmlProductsStr = xmlProducts.join("");
  //console.log('xmlProductsStr', xmlProductsStr);
  xml = `<?xml version="1.0" encoding="UTF-8" ?><products>${xmlProductsStr}</products>`;

  try {
    saveS3("socloz.xml", xml);
  } catch (e) {
    console.log("error s3", e);
  }
};

const parseResults = (inventory) => {
  const products = {};

  inventory.map((formatedLine) => {
    let currentProduct;

    if (!_.get(formatedLine, "__parentId")) {
      //console.log('formatedLine NO PARENTID', formatedLine);
      formatedLine["__parentId"] = formatedLine["id"];
      currentProduct = formatedLine;
      currentProduct["variants"] = [];
      currentProduct["collections"] = [];
    } else {
      currentProduct = products[formatedLine["__parentId"]];

      if (_.get(formatedLine, "sku") && currentProduct) {
        currentProduct["variants"].push(formatedLine);
      }

      if (_.get(formatedLine, "title") && currentProduct) {
        currentProduct["collections"].push(formatedLine);
      }
    }

    if (currentProduct) {
      products[formatedLine["__parentId"]] = currentProduct;
    }
  });

  return products;
};

/**
 * https://myshopicloz.s3.eu-west-3.amazonaws.com/socloz.xml
 * Fichier de sauvegarde SoCloz
 */
const saveS3 = (pathFile, content) => {
  var params = { Bucket: S3BUCKET, Key: `${pathFile}`, Body: content };
  s3.putObject(params, function (err, data) {
    if (err) {
      console.log(err);
      db.log(SHOP, "socloz-export", {
        success: false,
        message: `${S3BUCKET}/${pathFile}`,
      });
    } else {
      db.log(SHOP, "socloz-export", {
        success: true,
        message: `${S3BUCKET}/${pathFile}`,
      });
    }
  });
};
