import axios from "axios";
import dotenv from "dotenv";
import _ from "lodash";

import { getUrl } from "./query";
import { getFulfillmentServiceByName } from "./fulfillmentService";

dotenv.config();

/**
 *  GET /admin/api/2020-04/orders/#{order_id}/fulfillments/#{fulfillment_id}/events.json
    Retrieves a list of fulfillment events for a specific fulfillment

    GET /admin/api/2020-04/orders/#{order_id}/fulfillments/#{fulfillment_id}/events/#{event_id}.json
    Retrieves a specific fulfillment event

    POST /admin/api/2020-04/orders/#{order_id}/fulfillments/#{fulfillment_id}/events.json
    Creates a fulfillment event

    DELETE /admin/api/2020-04/orders/#{order_id}/fulfillments/#{fulfillment_id}/events/#{event_id}.json
    Deletes a fulfillment event
*/

export const getFulfillmentEvents = async (orderId, fulfillmentId) => {
  const result = await axios.get(
    `${getUrl()}/orders/${orderId}/fulfillments/${fulfillmentId}/events.json`
  );

  return result.data.fulfillment_events;
};

export const getFulfillmentEvent = async (orderId, fulfillmentId, eventId) => {
  const result = await axios.get(
    `${getUrl()}/orders/${orderId}/fulfillments/${fulfillmentId}/events/${eventId}.json`
  );

  return result.data.fulfillment_event;
};

/**
 * The status of the fulfillment event. Valid values:
 * label_printed: A label for the shipment was purchased and printed.
 * label_purchased: A label for the shipment was purchased, but not printed.
 * attempted_delivery: Delivery of the shipment was attempted, but unable to be completed.
 * ready_for_pickup: The shipment is ready for pickup at a shipping depot.
 * confirmed: The carrier is aware of the shipment, but hasn't received it yet.
 * in_transit: The shipment is being transported between shipping facilities on the way to its destination.
 * out_for_delivery: The shipment is being delivered to its final destination.
 * delivered: The shipment was succesfully delivered.
 * failure: Something went wrong when pulling tracking information for the shipment, such as the tracking number was invalid or the shipment was canceled.
 * @param {*} orderId
 * @param {*} fulfillmentId
 * @param {*} changeset
 */
export const createFulfillmentEvent = async (
  orderId,
  fulfillmentId,
  changeset
) => {
  // const changeset = {
  //   "status": "in_transit",
  //   "message": "Votre colis est en route"
  // }

  let result = null;
  console.log(
    "fulfillmentevent URL",
    `${getUrl()}/orders/${orderId}/fulfillments/${fulfillmentId}/events.json`
  );

  try {
    const req = await axios.post(
      `${getUrl()}/orders/${orderId}/fulfillments/${fulfillmentId}/events.json`,
      {
        event: changeset,
      }
    );
    result = req.data.fulfillment_event;
  } catch (e) {
    console.log(
      "createFulfillmentEvent error :",
      _.get(e, "response.data.errors", _.get(e, "response.data.error", e))
    );
  }

  return result;
};

export const deleteFulfillmentEvent = async (
  orderId,
  fulfillmentId,
  eventId
) => {
  const result = await axios.delete(
    `${getUrl()}/orders/${orderId}/fulfillments/${fulfillmentId}/events/${eventId}.json`
  );

  return result.data;
};
