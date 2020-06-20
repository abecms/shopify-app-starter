import * as fastmag from "../fastmag";
import * as shopify from "../shopify";
import * as db from "../database";
import * as services from "../services";
import * as socloz from "../socloz";
import dotenv from "dotenv";

dotenv.config();
const { SHOP } = process.env;
var CronJob = require("cron").CronJob;

// at 1:00 am everyday:   0 1 * * *
// every minute:        */1 * * * *
export const init = () => {
  /**
   * Check the stock movements every 2 minutes
   */
  const differentialStock = new CronJob(
    "*/2 * * * *",
    function () {
      services.syncDifferentialStocks();
    },
    null,
    true,
    "Europe/Paris"
  );

  /**
   * Sync order statuses every 30 minutes
   */
  var syncOrderStatuses = new CronJob(
    "*/30 * * * *",
    function () {
      services.syncOrderStatuses();
    },
    null,
    true,
    "Europe/Paris"
  );

  /**
   * Send the giftcards emails every 45'
   */
  var giftcard = new CronJob(
    "*/45 * * * *",
    function () {
      services.sendGiftcards(SHOP);
    },
    null,
    true,
    "Europe/Paris"
  );

  /**
   * Create the soCloz file everyday at 3h30 AM
   */
  var socloz = new CronJob(
    "30 3 * * *",
    function () {
      socloz.exportCatalog();
    },
    null,
    true,
    "Europe/Paris"
  );
};
