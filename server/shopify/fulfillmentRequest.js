import axios from "axios";
import dotenv from "dotenv";
import _ from "lodash";

import { getUrl } from "./query";

dotenv.config();

const { HOST } = process.env;

/**
 *  POST /admin/api/2020-07/fulfillment_orders/{fulfillment_order_id}/fulfillment_request.json
    Sends a fulfillment request

    POST /admin/api/2020-07/fulfillment_orders/{fulfillment_order_id}/fulfillment_request/accept.json
    Accepts a fulfillment request

    POST /admin/api/2020-07/fulfillment_orders/{fulfillment_order_id}/fulfillment_request/reject.json
    Rejects a fulfillment request
*/

export const createFulfillmentRequest = async (
  fulfillmentOrderId,
  changeset
) => {
  //changeset = {message: "Fulfill this ASAP please."};

  const result = await axios.get(
    `${getUrl()}/fulfillment_orders/${fulfillmentOrderId}/fulfillment_request.json`,
    {
      fulfillment_request: changeset,
    }
  );

  return result.data.submitted_fulfillment_order;
};

export const acceptFulfillmentRequest = async (
  fulfillmentOrderId,
  changeset
) => {
  //changeset = {message: "Ok to fulfill your request."};

  const result = await axios.get(
    `${getUrl()}/fulfillment_orders/${fulfillmentOrderId}/fulfillment_request/accept.json`,
    {
      fulfillment_request: changeset,
    }
  );

  return result.data.fulfillment_order;
};

export const rejectFulfillmentRequest = async (
  fulfillmentOrderId,
  changeset
) => {
  //changeset = {message: "Not OK to fulfill your request."};

  const result = await axios.get(
    `${getUrl()}/fulfillment_orders/${fulfillmentOrderId}/fulfillment_request/reject.json`,
    {
      fulfillment_request: changeset,
    }
  );

  return result.data.fulfillment_order;
};
