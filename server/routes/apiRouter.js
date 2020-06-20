import Router from "koa-router";
import shopifyRouter from "./shopifyRouter";
import frontRouter from "./frontRouter";
import webhooksRouter from "./webhooksRouter";

const apiRouter = new Router({ prefix: "/app" });

const nestedRoutes = [
  shopifyRouter,
  frontRouter,
  webhooksRouter,
];
for (var router of nestedRoutes) {
  apiRouter.use(router.routes(), router.allowedMethods());
}

export default apiRouter;
