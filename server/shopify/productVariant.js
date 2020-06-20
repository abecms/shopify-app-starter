import axios from "axios";
import dotenv from "dotenv";
import _ from "lodash";
import Bottleneck from "bottleneck";
import { getUrl, getNextPage } from "./query";

dotenv.config();

const { SHOP, ACCESS_TOKEN } = process.env;

/**
 *  GET /admin/api/2020-04/products/#{product_id}/variants.json
    Retrieves a list of product variants

    GET /admin/api/2020-04/products/#{product_id}/variants/count.json
    Receive a count of all Product Variants

    GET /admin/api/2020-04/variants/#{variant_id}.json
    Receive a single Product Variant

    POST /admin/api/2020-04/products/#{product_id}/variants.json
    Create a new Product Variant

    PUT /admin/api/2020-04/variants/#{variant_id}.json
    Modify an existing Product Variant

    DELETE /admin/api/2020-04/products/#{product_id}/variants/#{variant_id}.json
    Remove an existing Product Variant
 */

/**
 * tous les variants avec leur stock et leur id erp contenu dans barcode
 * On part du principe qu'il n'y a qu'un seul stock
 * Get the full inventory
 * @param {*} inventoryLevelId
 * @param {*} qty
 */
export const getFullProductVariants = async (locationId) => {
  //console.log('locationId', locationId)
  const gidLocation = `gid://shopify/Location/${locationId}`;
  const inventory = new Object();
  const query = `{
    productVariants {
      edges {
        node {
          id
          legacyResourceId
          sku
          displayName
          barcode
          price
          inventoryItem {
            inventoryLevel(locationId: "${gidLocation}") {
              id
              available
            }
          }
        }
      }
    }
  }`;

  await createBulkOperation(query);
  const validate = (currentOp) =>
    _.get(currentOp.data, "data.currentBulkOperation.status", null) ===
    "COMPLETED";
  let op = null;
  try {
    op = await poll({
      fn: getCurrentBulkOperation,
      validate: validate,
      interval: 20000,
      maxAttempts: 15,
    });
  } catch (err) {
    console.error(err);
  }

  const resultUrl = _.get(op, "data.data.currentBulkOperation.url");
  //console.log('resultUrl', resultUrl);

  if (resultUrl) {
    await axios({
      method: "get",
      url: op.data.data.currentBulkOperation.url,
      responseType: "stream",
    })
      .then(async (response) => {
        var myInterface = readline.createInterface({
          input: response.data,
        });

        var lineno = 0;
        await new Promise(function (resolve, reject) {
          myInterface.on("line", function (line) {
            lineno++;
            //console.log('Line number ' + lineno + ': ' + line);
            const res = JSON.parse(line);
            inventory[res.sku] = res;
          });
          myInterface.on("close", function () {
            resolve();
          });
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return inventory;
};

export const getProductVariantsBySku = async (sku) => {
  const query = {
    query: `query($filter: String!) {
      products(first:8, query:$filter) {
        edges {
          node {
            id
            title
            variants(first:100) {
              edges {
                node {
                  sku
                  id
                  title
                }
              }
            }
          }
        }
      }
    }`,
    variables: {
      filter: `sku:${sku}|*`,
    },
  };

  let result = null;
  try {
    const req = await axios.post(`${getUrl()}/graphql.json`, query);

    result = req.data.data.products.edges;
  } catch (e) {
    console.log(
      "getAllOrdersGQ error :",
      _.get(e, "response.data.errors", _.get(e, "response.data.error", e))
    );
  }

  return result;
};

export const getProductVariants = async (id) => {
  const result = await axios.get(`${getUrl()}/products/${id}/variants.json`);

  return result.data;
};

export const getVariant = async (id) => {
  let result = null;

  try {
    const req = await axios.get(`${getUrl()}/variants/${id}.json`);

    result = req.data.variant;
  } catch (e) {
    console.log(
      "getVariant error :",
      _.get(e, "response.data.errors", _.get(e, "response.data.error", e))
    );
  }

  return result;
};

export const getVariantMetafields = async (id) => {
  const result = await axios.get(`${getUrl()}/variants/${id}/metafields.json`);

  return result.data;
};

/**
 * When you change the price, be cautious that the compare_at_price is null or is > price
 * @param {*} variantId
 * @param {*} changeset
 */
export const updateVariant = async (variantId, changeset) => {
  changeset = {
    variant: {
      id: Number(variantId),
      ...changeset,
    },
  };
  //console.log(variantId, changeset)

  let result = null;

  try {
    const variant = await axios.put(
      `${getUrl()}/variants/${variantId}.json`,
      changeset
    );
    //console.log('bucket shopify', variant.headers['X-Shopify-Shop-Api-Call-Limit']);

    result = variant.data;
  } catch (e) {
    console.log("updateVariant error", e);
  }

  return result;
};
