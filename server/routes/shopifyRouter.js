import Router from "koa-router";
import axios from "axios";
import * as shopify from "../shopify";
import dotenv from "dotenv";
import koaBody from "koa-body";
import Bottleneck from "bottleneck";
import _ from "lodash";
import * as db from "../database";

dotenv.config();

const { SHOPIFY_PRIVATE_API_KEY, HOST } = process.env;
const shopifyRouter = new Router({ prefix: "/shopify" });

shopifyRouter.get("/test-delete-store", koaBody(), async (ctx) => {
  let store = await db.deleteTable();

  ctx.body = {
    status: "success",
    result: store,
  };
});


shopifyRouter.get("/test-get-inventory", koaBody(), async (ctx) => {
  const shopifyInventory = await shopify.getFullInventory();
  for (var key in shopifyInventory) {
    const item = shopifyInventory[key];
    console.log(key, item);
  }

  ctx.body = {
    status: "success",
    result: shopifyInventory,
  };
});

shopifyRouter.get("/test-get-fulfillmentServices", koaBody(), async (ctx) => {
  const service = await shopify.getFulfillmentServices();

  ctx.body = {
    status: "success",
    result: service,
  };
});

shopifyRouter.get("/test-get-fulfillmentService", koaBody(), async (ctx) => {
  const fulfillmentServiceId = 54102655021;
  const service = await shopify.getFulfillmentService(fulfillmentServiceId);

  ctx.body = {
    status: "success",
    result: service,
  };
});

shopifyRouter.get(
  "/test-get-fulfillmentServiceByName",
  koaBody(),
  async (ctx) => {
    const fulfillmentService = "service";
    const service = await shopify.getFulfillmentServiceByName(
      fulfillmentService
    );

    ctx.body = {
      status: "success",
      result: service,
    };
  }
);

shopifyRouter.get("/test-post-fulfillmentService", koaBody(), async (ctx) => {
  const changeset = {
    name: "service",
    callback_url: `${HOST}/app/service`,
    inventory_management: true,
    tracking_support: true,
    requires_shipping_method: true,
    format: "json",
  };
  const service = await shopify.createFulfillmentService(changeset);

  ctx.body = {
    status: "success",
    result: service,
  };
});

shopifyRouter.get("/test-put-fulfillmentService", koaBody(), async (ctx) => {
  const fulfillmentServiceId = 51827638327;
  const service = await shopify.updateFulfillmentService(fulfillmentServiceId);

  ctx.body = {
    status: "success",
    result: service,
  };
});

shopifyRouter.get("/test-get-inventorylevels", koaBody(), async (ctx) => {
  const locationId = 46639939629;
  const levels = await shopify.getInventoryLevels(locationId);

  ctx.body = {
    status: "success",
    result: levels,
  };
});

shopifyRouter.get("/test-connect-inventorylevels", koaBody(), async (ctx) => {
  const inventoryItemId = 35060749533229;

  const fulfillmentsservices = await shopify.getFulfillmentServices();
  const locationId = fulfillmentsservices[0]["location_id"];
  await shopify.connectInventoryLevels(locationId, inventoryItemId);

  ctx.body = {
    status: "success",
    result: true,
  };
});

/**
 * This route will connect all products from a shopify stock to a fulfillment service stock
 */
shopifyRouter.get("/connect-inventorylevels", koaBody(), async (ctx) => {
  const shopifyLocationId = 35648602167;

  const service = await shopify.getFulfillmentServiceByName("service");
  const locationId = _.get(service, "location_id", null);
  const levels = await shopify.getInventoryLevels(shopifyLocationId);
  // Never more than 2 requests running at a time.
  // Wait at least 1000ms between each request.
  const limiter = new Bottleneck({
    reservoir: 80, // initial value
    reservoirIncreaseAmount: 4,
    reservoirIncreaseInterval: 1000, // must be divisible by 250
    reservoirIncreaseMaximum: 80,

    // also use maxConcurrent and/or minTime for safety
    maxConcurrent: 5,
    minTime: 250, // pick a value that makes sense for your use case
  });

  levels.map((item) => {
    limiter
      .schedule(
        shopify.connectInventoryLevels,
        locationId,
        item["inventory_item_id"]
      )
      .then((result) => {
        console.log("connexion réalisée", result);
      });
  });

  ctx.body = {
    status: "success",
    result: true,
  };
});

shopifyRouter.get("/test-get-locations", koaBody(), async (ctx) => {
  const locations = await shopify.getLocations();

  ctx.body = {
    status: "success",
    result: locations,
  };
});

shopifyRouter.get("/delete-all-products", koaBody(), async (ctx) => {
  const products = await shopify.deleteAllProducts();

  ctx.body = {
    status: "success",
    result: products,
  };
});

shopifyRouter.get("/test-get-products", koaBody(), async (ctx) => {
  const products = await shopify.getProducts();

  ctx.body = {
    status: "success",
    result: products,
  };
});

shopifyRouter.get("/test-get-product-variants", koaBody(), async (ctx) => {
  const productId = 5073666015277;
  const get = await shopify.getProductVariants(productId);

  ctx.body = {
    status: "success",
    result: get,
  };
});

shopifyRouter.get("/test-get-variant", koaBody(), async (ctx) => {
  const variantId = 5073665884205;
  const get = await shopify.getVariant(variantId);

  ctx.body = {
    status: "success",
    result: get,
  };
});

shopifyRouter.get("/test-put-variant-price", koaBody(), async (ctx) => {
  //good 34292705853485
  //bad 34291181256749
  const variantId = 34291181256749;
  const update = await shopify.updateVariant(variantId, {
    price: "79.99",
    compare_at_price: "109.00",
  });

  ctx.body = {
    status: "success",
    result: update,
  };
});

shopifyRouter.get("/test-put-variant-metafield", koaBody(), async (ctx) => {
  const variantId = 34291181256749;
  const update = await shopify.updateVariant(variantId, {
    metafields: [
      {
        key: "metafield-id",
        value: "newvalue",
        value_type: "string",
        namespace: "global",
      },
    ],
  });

  ctx.body = {
    status: "success",
    result: update,
  };
});

shopifyRouter.get("/test-put-product", koaBody(), async (ctx) => {
  const id = 5035807277101;
  const tag = "promo_presoldes_30_2020-06-06_2020-06-20";
  const tags = `${product.tags.join(",")},${tag}`;
  const changeset = {
    id: "5035807277101",
    tags: tags,
  };
  const update = await shopify.updateProduct(id, changeset);

  ctx.body = {
    status: "success",
    result: update,
  };
});

shopifyRouter.get("/test-getall-orders", koaBody(), async (ctx) => {
  const get = await shopify.getAllOrders(["fulfillment_status=unshipped"]);

  ctx.body = {
    status: "success",
    result: get,
  };
});

shopifyRouter.get("/test-get-orders", koaBody(), async (ctx) => {
  const get = await shopify.getAllOrdersGQL(
    "created_at:>'2020-05-30T00:00:00+0100' AND fulfillment_status:unshipped"
  );

  ctx.body = {
    status: "success",
    result: get,
  };
});

shopifyRouter.get("/get-order", koaBody(), async (ctx) => {
  let id = ctx.query["id"];
  const result = await shopify.getOrder(id);
  const orderMetafields = await shopify.getOrderMetafields(id);
  console.log("orderMetafields", orderMetafields);
  const found = _.get(orderMetafields, "key") === "order-id";
  console.log("found", found);

  ctx.body = {
    status: "success",
    result: result,
  };
});

shopifyRouter.get("/test-get-transactions", koaBody(), async (ctx) => {
  const id = 2395038744621;
  const result = await shopify.getTransactions(id);

  ctx.body = {
    status: "success",
    result: result,
  };
});

shopifyRouter.get("/test-put-order", koaBody(), async (ctx) => {
  const id = 2395038744621;
  const update = await shopify.updateOrder(id, {
    note: "Customer contacted us about a custom engraving on this iPod",
    note_attributes: [
      {
        name: "colour",
        value: "red",
      },
    ],
    tags: "External, Inbound, Outbound",
    metafields: [
      {
        key: "order-id",
        value: "234564746",
        value_type: "string",
        namespace: "global",
      },
    ],
  });

  ctx.body = {
    status: "success",
    result: update,
  };
});

shopifyRouter.get("/test-get-fulfillments", koaBody(), async (ctx) => {
  let id = ctx.query["id"];
  const fulfillments = await shopify.getFulfillments(id);

  ctx.body = {
    status: "success",
    result: fulfillments,
  };
});

shopifyRouter.get("/test-get-fulfillment", koaBody(), async (ctx) => {
  const orderId = 2323757989933;
  const fulfillmentId = 2134466068525;
  const fulfillment = await shopify.getFulfillment(orderId, fulfillmentId);

  ctx.body = {
    status: "success",
    result: fulfillment,
  };
});

shopifyRouter.get("/test-post-fulfillment", koaBody(), async (ctx) => {
  const orderId = 2323757989933;
  const fulfillment = await shopify.createFulfillment(orderId);

  ctx.body = {
    status: "success",
    result: fulfillment,
  };
});

shopifyRouter.get("/test-post-openFulfillment", koaBody(), async (ctx) => {
  const orderId = 2323757989933;
  const fulfillmentId = 2134466068525;
  const fulfillment = await shopify.openFulfillment(orderId, fulfillmentId);

  ctx.body = {
    status: "success",
    result: fulfillment,
  };
});

shopifyRouter.get("/test-post-completeFulfillment", koaBody(), async (ctx) => {
  const orderId = 2323757989933;
  const fulfillmentId = 2134466068525;
  const fulfillment = await shopify.completeFulfillment(orderId, fulfillmentId);

  ctx.body = {
    status: "success",
    result: fulfillment,
  };
});

shopifyRouter.get("/test-post-updateTracking", koaBody(), async (ctx) => {
  const fulfillmentId = 2134466068525;
  const changeset = {
    notify_customer: true,
    tracking_info: {
      number: "1111",
      url: "http://www.my-url.com",
      company: "my-company",
    },
  };
  const fulfillment = await shopify.updateTracking(fulfillmentId, changeset);

  ctx.body = {
    status: "success",
    result: fulfillment,
  };
});

shopifyRouter.get(
  "/test-post-createFulfillmentEvent",
  koaBody(),
  async (ctx) => {
    const orderId = 2323757989933;
    const fulfillmentId = 2134466068525;
    const changeset = {
      status: "in_transit",
      message: "Votre colis est en route",
    };
    const event = await shopify.createFulfillmentEvent(
      orderId,
      fulfillmentId,
      changeset
    );

    ctx.body = {
      status: "success",
      result: event,
    };
  }
);

shopifyRouter.get("/test-post-closeOrder", koaBody(), async (ctx) => {
  const orderId = 2323757989933;
  const order = await shopify.closeOrder(orderId);

  ctx.body = {
    status: "success",
    result: order,
  };
});

shopifyRouter.get("/test-get-giftcard", koaBody(), async (ctx) => {
  const giftcardId = 421472174125;
  const giftcard = await shopify.getGiftCard(giftcardId);

  const note = JSON.parse(giftcard.note);
  console.log("note", note);

  ctx.body = {
    status: "success",
    result: note,
  };
});

shopifyRouter.get("/test-post-giftcard", koaBody(), async (ctx) => {
  const changeset = {
    note: "This is a note",
    initial_value: 100.0,
    code: "W123456",
    template_suffix: "birthday",
  };
  const card = await shopify.createGiftCard(changeset);

  ctx.body = {
    status: "success",
    result: card,
  };
});

shopifyRouter.get("/test-post-reopenOrder", koaBody(), async (ctx) => {
  const orderId = 2323757989933;
  const order = await shopify.reopenOrder(orderId);

  ctx.body = {
    status: "success",
    result: order,
  };
});

shopifyRouter.get("/dev2", async (ctx) => {
  const result = await axios.post(
    "https://glceonline.myshopify.com/admin/api/2019-10/graphql.json",
    updateInventory(
      "gid://shopify/InventoryLevel/33001144408?inventory_item_id=31504217276504",
      1
    ),
    {
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_PRIVATE_API_KEY,
      },
    }
  );

  console.log(result.data);
  ctx.body = {
    result: result.data,
  };
});

/**
 * Body
{
  query: `query($filter: String!) {
    productVariants(first: 1, query: $filter) {
      edges {
          node {
          id
          sku
          legacyResourceId
          displayName
          inventoryItem {
            id
            legacyResourceId
          }
        }
      }
    }
  }`,
  variables: {
    filter: `sku:my-custom-sku`
  }
}
 */

shopifyRouter.get("/dev", async (ctx) => {
  const result = await axios.post(
    "https://glceonline.myshopify.com/admin/api/2019-10/graphql.json",
    {
      query: queryGetStock,
      variables: {
        filter: `sku:AAAAAA`,
      },
    },
    {
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_PRIVATE_API_KEY,
      },
    }
  );

  console.log(result.data);
  ctx.body = {
    result: result.data,
  };
});

// Route de dev afin de tester les endpoints Middleware & shopify
shopifyRouter.get("/devok", async (ctx) => {
  axios.post(
    `https://${ctx.cookies.get("shopOrigin")}/admin/api/2019-10/products.json`,
    {
      product: {
        title: `SKU - ${product.sku}`,
        vendor: product.sub_fam_label,
        product_type: product.fam_label,
      },
    },
    {
      headers: {
        "X-Shopify-Access-Token": ctx.cookies.get("accessToken"),
      },
    }
  );
  ctx.body = {
    status: "success",
  };
});

shopifyRouter.post("/notification/itemsUpdated", async (ctx) => {
  try {
    const result = await axios(
      `https://middleware-dot-gl-dsi-glce-int-bh.appspot.com/api/items?family=&view=full`
    );
    const products = result.data.data;
    const sample = products.slice(0, 20);
    console.log("sample", sample);
    // Never more than 5 requests running at a time.
    // Wait at least 1000ms between each request.
    // const limiter = new Bottleneck({
    //   maxConcurrent: 2,
    //   minTime: 1000
    // });
    // const createProduct = (product, ctx) => {
    //   axios.post(
    //     `https://${ctx.cookies.get(
    //       "shopOrigin"
    //     )}/admin/api/2019-10/products.json`,
    //     {
    //       product: {
    //         title: `SKU - ${product.sku}`,
    //         vendor: product.sub_fam_label,
    //         product_type: product.fam_label
    //       }
    //     },
    //     {
    //       headers: {
    //         "X-Shopify-Access-Token": ctx.cookies.get("accessToken")
    //       }
    //     }
    //   );
    // };
    // sample.map((product, index) => {
    //   limiter.schedule(createProduct, product, ctx).then(result => {
    //     console.log("produit ajouté");
    //   });
    // });
    // //console.log('products', products)
    // // const results = await axios.post(
    // //   `https://${ctx.cookies.get('shopOrigin')}/admin/api/2019-10/products.json`,
    // //   {
    // //     headers: {"X-Shopify-Access-Token": ctx.cookies.get('accessToken')},
    // //   }
    // // )
    // // /admin/api/2019-10/products.json
    // // {
    // //   "product": {
    // //     "title": "Burton Custom Freestyle 151",
    // //     "body_html": "<strong>Good snowboard!</strong>",
    // //     "vendor": "Burton",
    // //     "product_type": "Snowboard",
    // //     "tags": "Barnes & Noble, John's Fav, \"Big Air\""
    // // }
    ctx.body = {
      status: "success",
    };
  } catch (err) {
    console.log(err.message);
  }
});

/**
   * {
      "data_type": "item_stock_price",
      "data": {
        "ean": "",
        "sku": "",
        "stock": ##,
        "current_price_ht": #.##,
        "regular_price_ht": #.##
      }
    }
   */
shopifyRouter.put("/items/:sku/stock", async (ctx) => {
  try {
    const json = ctx.request.body;
    const stock = json.data.stock;
    const sku = ctx.params.sku;

    const result = await shopify.updateInventoryFromSku(sku, stock);

    ctx.body = {
      status: "success",
    };
  } catch (err) {
    console.log(err.message);
    ctx.body = {
      status: `error: ${err.message}`,
    };
  }
});

/**
   * STATUT DE LIVRAISON
   * {
        "order_code": "1300438957371",
        "lines": [
          {
            "return_id": "0004094095",
            "sequence_number": 1,
            "ean": "46210120",
            "quantity": 2,
            "status_code": "RETURNED",
            "status_date": 1515169140000,
            "compliance_indicator": 1
          },
          {
            "return_id": "0004094095",
            "sequence_number": 2,
            "ean": "56210120",
            "quantity": 3,
            "status_code": "RETURNED",
            "status_date": 1515169140000,
            "compliance_indicator": 1
          }
        ]
      }

      OU COLISSAGE

      {
        "order_code": "1300438258154"
        "lines": [
          {
            "sequence_number": 1,
            "ean": "46210120",
            "quantity": 2,
            "status_code": "SHIPPED",
            "status_date": 1515169140000,
            "parcel": [
              {
                "transporter": "CHRONOPOST",
                "parcel_number": "000000910001718720",
                "tracking_number": "XW871299514FR",
                "tracking_number_URL": "http://transporteur/XW871299514FR",
                "parcel_quantity": 1
              },
              {
                "transporter": "CHRONOPOST",
                "parcel_number": "000000910001718721",
                "tracking_number": "XW871299515FR",
                "tracking_number_URL": "http://transporteur/XW871299515FR",
                "parcel_quantity": 1
              }
            ]
          },
          {
            "sequence_number": 2,
            "ean": "56210120",
            "quantity": 3,
            "status_code": "SHIPPED",
            "status_date": 1515169140000,
            "parcel": [
              {
                "transporter": "CHRONOPOST",
                "parcel_number": "000000910001718722",
                "tracking_number": "XW871299516FR",
                "tracking_number_URL": "http://transporteur/XW871299516FR",
                "parcel_quantity": 1
              },
              {
                "transporter": "CHRONOPOST",
                "parcel_number": "000000910001718723",
                "tracking_number": "XW871299517FR",
                "tracking_number_URL": "http://transporteur/XW871299517FR",
                "parcel_quantity": 2
              }
            ]
          }
        ]
      }
   */
shopifyRouter.put("/orders/:id", async (ctx) => {
  try {
    const json = ctx.request.body;
    ctx.body = {
      status: "success",
      result: json,
    };
  } catch (err) {
    console.log(err.message);
    ctx.body = {
      status: `error: ${err.message}`,
    };
  }
});

shopifyRouter.get("/test-post-pricerule", koaBody(), async (ctx) => {
  const changeset = {
    title: "15OFFCOLLECTION",
    target_type: "line_item",
    target_selection: "entitled",
    allocation_method: "across",
    value_type: "percentage",
    value: "-15.0",
    customer_selection: "all",
    starts_at: "2020-01-19T17:59:10Z",
  };
  const result = await shopify.getOrder(changeset);

  ctx.body = {
    status: "success",
    result: result,
  };
});

export default shopifyRouter;
