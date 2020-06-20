import Router from "koa-router";
import Bottleneck from "bottleneck";
import axios from 'axios';

const frontRouter = new Router({ prefix: "/front" });

frontRouter.get("/categories", async ctx => {
  try {
    const result = await axios(
      "https://middleware-dot-gl-dsi-glce-int-bh.appspot.com/api/families"
    );

    ctx.body = {
      status: "success",
      data: result.data.data
    };
  } catch (err) {
    console.log(err);
  }
});

frontRouter.get("/products", async ctx => {
  console.log("products");
  console.log(ctx.query);
  if (ctx.query.family) {
    try {
      const result = await axios(
        `https://middleware-dot-gl-dsi-glce-int-bh.appspot.com/api/items?family=${ctx.query.family}&view=full`
      );
      const products = result.data.data;
      const sample = products.slice(0, 20);
      // Never more than 5 requests running at a time.
      // Wait at least 1000ms between each request.
      const limiter = new Bottleneck({
        maxConcurrent: 2,
        minTime: 1000
      });
      const createProduct = (product, ctx) => {
        axios.post(
          `https://${ctx.cookies.get(
            "shopOrigin"
          )}/admin/api/2019-10/products.json`,
          {
            product: {
              title: `SKU - ${product.sku}`,
              vendor: product.sub_fam_label,
              product_type: product.fam_label
            }
          },
          {
            headers: {
              "X-Shopify-Access-Token": ctx.cookies.get("accessToken")
            }
          }
        );
      };
      sample.map((product, index) => {
        limiter.schedule(createProduct, product, ctx).then(result => {
          console.log("produit ajouté");
        });
      });
      //console.log('products', products)
      // const results = await axios.post(
      //   `https://${ctx.cookies.get('shopOrigin')}/admin/api/2019-10/products.json`,
      //   {
      //     headers: {"X-Shopify-Access-Token": ctx.cookies.get('accessToken')},
      //   }
      // )
      // /admin/api/2019-10/products.json
      // {
      //   "product": {
      //     "title": "Burton Custom Freestyle 151",
      //     "body_html": "<strong>Good snowboard!</strong>",
      //     "vendor": "Burton",
      //     "product_type": "Snowboard",
      //     "tags": "Barnes & Noble, John's Fav, \"Big Air\""
      // }
      ctx.body = {
        status: "success",
        data: products
      };
    } catch (err) {
      console.log(err);
    }
  } else {
    ctx.body = {
      status: "error",
      data: []
    };
  }
});

export default frontRouter;
