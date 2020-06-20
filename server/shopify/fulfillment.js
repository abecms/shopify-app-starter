import axios from "axios";
import dotenv from "dotenv";
import _ from "lodash";

import { getUrl } from "./query";
import { getFulfillmentServiceByName } from "./fulfillmentService";

dotenv.config();

/**
 *  GET /admin/api/2020-04/orders/#{order_id}/fulfillments.json
    Retrieves fulfillments associated with an order

    GET /admin/api/2020-04/fulfillment_orders/#{fulfillment_order_id}/fulfillments.json
    Retrieves fulfillments associated with a fulfillment order

    GET /admin/api/2020-04/orders/#{order_id}/fulfillments/count.json
    Retrieves a count of fulfillments associated with a specific order

    GET /admin/api/2020-04/orders/#{order_id}/fulfillments/#{fulfillment_id}.json
    Receive a single Fulfillment

    POST /admin/api/2020-04/orders/#{order_id}/fulfillments.json
    Create a new Fulfillment

    POST /admin/api/2020-04/fulfillments.json
    Creates a fulfillment for one or many fulfillment orders

    PUT /admin/api/2020-04/orders/#{order_id}/fulfillments/#{fulfillment_id}.json
    Modify an existing Fulfillment

    POST /admin/api/2020-04/fulfillments/#{fulfillment_id}/update_tracking.json
    Updates the tracking information for a fulfillment

    POST /admin/api/2020-04/orders/#{order_id}/fulfillments/#{fulfillment_id}/complete.json
    Complete a fulfillment

    POST /admin/api/2020-04/orders/#{order_id}/fulfillments/#{fulfillment_id}/open.json
    Transition a fulfillment from pending to open.

    POST /admin/api/2020-04/orders/#{order_id}/fulfillments/#{fulfillment_id}/cancel.json
    Cancel a fulfillment for a specific order ID

    POST /admin/api/2020-04/fulfillments/#{fulfillment_id}/cancel.json
    Cancels a fulfillment
*/

export const getFulfillments = async (orderId) => {
  const result = await axios.get(
    `${getUrl()}/orders/${orderId}/fulfillments.json`
  );

  return result.data.fulfillments;
};

export const getFulfillment = async (orderId, fulfillmentId) => {
  const result = await axios.get(
    `${getUrl()}/orders/${orderId}/fulfillments/${fulfillmentId}.json`
  );

  return result.data.fulfillment;
};

export const getFulfillmentOrderFulfillments = async (fulfillment_order_id) => {
  const result = await axios.get(
    `${getUrl()}/fulfillment_orders/${fulfillment_order_id}/fulfillments.json`
  );

  return result.data.fulfillments;
};

export const createFulfillment = async (orderId) => {
  const service = await getFulfillmentServiceByName("service");
  const locationId = _.get(service, "location_id", null);
  let result = null;
  try {
    const req = await axios.post(
      `${getUrl()}/orders/${orderId}/fulfillments.json`,
      {
        fulfillment: {
          location_id: locationId,
        },
      }
    );

    result = req.data.fulfillment;
  } catch (e) {
    console.log(
      "createFulfillment error :",
      _.get(e, "response.data.errors", _.get(e, "response.data.error", e))
    );
  }

  return result;
};

export const updateFulfillment = async (orderId, fulfillmentId, changeset) => {
  const result = await axios.put(
    `${getUrl()}/orders/${orderId}/fulfillments/${fulfillmentId}.json`,
    {
      fulfillment: changeset,
    }
  );

  return result.data.fulfillment;
};

export const updateTracking = async (fulfillmentId, changeset) => {
  // changeset = {
  //   "notify_customer": true,
  //   "tracking_info": {
  //     "number": "1111",
  //     "url": "http://www.my-url.com",
  //     "company": "my-company"
  //   }
  // }
  const result = await axios.post(
    `${getUrl()}/fulfillments/${fulfillmentId}/update_tracking.json`,
    {
      fulfillment: changeset,
    }
  );

  return result.data.fulfillment;
};

export const openFulfillment = async (orderId, fulfillmentId) => {
  const result = await axios.post(
    `${getUrl()}/orders/${orderId}/fulfillments/${fulfillmentId}/open.json`,
    {}
  );

  return result.data.fulfillment;
};

export const completeFulfillment = async (orderId, fulfillmentId) => {
  const result = await axios.post(
    `${getUrl()}/orders/${orderId}/fulfillments/${fulfillmentId}/complete.json`,
    {}
  );

  return result.data.fulfillment;
};

export const cancelFulfillment = async (orderId, fulfillmentId) => {
  const result = await axios.post(
    `${getUrl()}/orders/${orderId}/fulfillments/${fulfillmentId}/cancel.json`,
    {}
  );

  return result.data.fulfillment;
};
