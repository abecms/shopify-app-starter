import axios from "axios";
import dotenv from "dotenv";
import _ from "lodash";
import Bottleneck from "bottleneck";
import { getUrl, getNextPage } from "./query";

dotenv.config();

const { SHOP, ACCESS_TOKEN } = process.env;

/**
 *  GET /admin/api/2020-04/orders.json
    Retrieves a list of orders

    GET /admin/api/2020-04/orders/#{order_id}.json
    Retrieves a specific order

    GET /admin/api/2020-04/orders/count.json
    Retrieves an order count

    POST /admin/api/2020-04/orders/#{order_id}/close.json
    Closes an order

    POST /admin/api/2020-04/orders/#{order_id}/open.json
    Re-opens a closed order

    POST /admin/api/2020-04/orders/#{order_id}/cancel.json
    Cancels an order

    POST /admin/api/2020-04/orders.json
    Creates an order

    PUT /admin/api/2020-04/orders/#{order_id}.json
    Updates an order

    DELETE /admin/api/2020-04/orders/#{order_id}.json
    Deletes an order

 */

export const getAllOrdersGQL = async (filter = "") => {
  //filter = "created_at:>'2020-05-30T00:00:00+0100' AND fulfillment_status:unshipped";
  const orders = [];
  let req = null;
  let cursor = null;
  let firstCall = true;

  try {
    while (firstCall || cursor) {
      if (firstCall) {
        firstCall = false;
      }
      const query = {
        query: `{
          orders(first: 100, query:"${filter}", after: ${cursor}) {
            pageInfo {
              hasNextPage
            }
            edges {
              cursor
              node {
                id
                legacyResourceId
                name
                note
                createdAt
                displayFinancialStatus
                displayFulfillmentStatus
                metafield(namespace:"global", key:"fastmag-order-id") {
                  id
                  value
                }
                fulfillments {
                  id
                  legacyResourceId
                  status
                }
              }
            }
          }
        }`,
      };
      req = await axios.post(`${getUrl()}/graphql.json`, query);
      const pageOrders = req.data.data.orders.edges;
      orders.push(...pageOrders);
      cursor =
        pageOrders[pageOrders.length - 1] &&
        pageOrders[pageOrders.length - 1].cursor
          ? `"${pageOrders[pageOrders.length - 1].cursor}"`
          : false;
    }
  } catch (e) {
    console.log(
      "getAllOrdersGQ error :",
      _.get(e, "response.data.errors", _.get(e, "response.data.error", e))
    );
  }

  return orders;
};

export const getAllOrders = async (filter = []) => {
  // limit=250&fulfillment_status=unshipped
  let result = null;
  filter = ["limit=250", ...filter];
  const queryString = filter.join("&");
  try {
    const req = await axios.get(`${getUrl()}/orders.json?${queryString}`);
    result = req.data.orders;
  } catch (e) {
    console.log("getAllOrders error", e);
  }

  return result;
};

export const getOrder = async (id) => {
  const result = await axios.get(`${getUrl()}/orders/${id}.json`);

  return result.data.order;
};

export const getOrderMetafields = async (id) => {
  const result = await axios.get(`${getUrl()}/orders/${id}/metafields.json`);

  return result.data.metafields;
};

/**
 * @param {*} orderId
 * @param {*} changeset
 */
export const updateOrder = async (orderId, changeset, async = false) => {
  changeset = {
    order: {
      id: orderId,
      ...changeset,
    },
  };
  //console.log(changeset)

  if (!async) {
    let result = false;
    try {
      result = await axios.put(`${getUrl()}/orders/${orderId}.json`, changeset);
    } catch (e) {
      console.log("error in shopify.updateOrder", e.response.data);
      return false;
    }

    return result.data;
  } else {
    return axios.put(`${getUrl()}/orders/${orderId}.json`, changeset);
  }
};

export const closeOrder = async (id) => {
  const result = await axios.post(`${getUrl()}/orders/${id}/close.json`, {});

  return result.data.order;
};

export const reopenOrder = async (id) => {
  const result = await axios.post(`${getUrl()}/orders/${id}/open.json`, {});

  return result.data.order;
};

export const cancelOrder = async (id) => {
  const result = await axios.post(`${getUrl()}/orders/${id}/cancel.json`, {});

  return result.data.order;
};
