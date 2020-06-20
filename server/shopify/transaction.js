import axios from "axios";
import dotenv from "dotenv";
import _ from "lodash";

import { getUrl } from "./query";

dotenv.config();

/**
 *  GET /admin/api/2020-07/orders/{order_id}/transactions.json
  Retrieves a list of transactions

  GET /admin/api/2020-07/orders/{order_id}/transactions/count.json
  Retrieves a count of an order's transactions

  GET /admin/api/2020-07/orders/{order_id}/transactions/{transaction_id}.json
  Retrieves a specific transaction

  POST /admin/api/2020-07/orders/{order_id}/transactions.json
  Creates a transaction for an order
*/

export const getTransactions = async (orderId) => {
  const result = await axios.get(
    `${getUrl()}/orders/${orderId}/transactions.json`
  );

  return result.data.transactions;
};
