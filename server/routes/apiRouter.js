import Router from "koa-router";
import shopifyRouter from "./shopifyRouter";
import frontRouter from "./frontRouter";
import webhooksRouter from "./webhooksRouter";
import soclozRouter from "./soclozRouter";

const apiRouter = new Router({ prefix: "/app" });

const nestedRoutes = [
  shopifyRouter,
  frontRouter,
  webhooksRouter,
  soclozRouter,
];
for (var router of nestedRoutes) {
  apiRouter.use(router.routes(), router.allowedMethods());
}

export default apiRouter;
