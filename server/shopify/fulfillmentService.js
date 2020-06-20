import axios from "axios";
import dotenv from "dotenv";
import _ from "lodash";
import { getUrl } from "./query";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
dotenv.config();

const { HOST } = process.env;

/**
 *  GET /admin/api/2020-04/fulfillment_services.json
    Receive a list of all FulfillmentServices

    POST /admin/api/2020-04/fulfillment_services.json
    Create a new FulfillmentService

    GET /admin/api/2020-04/fulfillment_services/#{fulfillment_service_id}.json
    Receive a single FulfillmentService

    PUT /admin/api/2020-04/fulfillment_services/#{fulfillment_service_id}.json
    Modify an existing FulfillmentService

    DELETE /admin/api/2020-04/fulfillment_services/#{fulfillment_service_id}.json
    Remove an existing FulfillmentService
*/

export const getFulfillmentServices = async () => {
  const query = {
    query: `{
      shop {
        fulfillmentServices {
          id
          handle
          location {
            id
            legacyResourceId
          }
        }
      }
    }`,
  };

  let result = null;
  try {
    const req = await axios.post(`${getUrl()}/graphql.json`, query);

    result = req.data.data.shop.fulfillmentServices;
  } catch (e) {
    console.log(
      "getFulfillmentServices error :",
      _.get(e, "response.data.errors", _.get(e, "response.data.error", e))
    );
  }

  return result;
};

//This query may result in a bug as Shopify may not return all the fulfillment services in some cases...
// export const getFulfillmentServices = async () => {
//   const result = await axios.get(`${getUrl()}/fulfillment_services.json`);

//   return result.data.fulfillment_services;
// };

export const getFulfillmentService = async (fulfillment_service_id) => {
  const result = await axios.get(
    `${getUrl()}/fulfillment_services/${fulfillment_service_id}.json`
  );

  return result.data.fulfillment_service;
};

export const getFulfillmentServiceByName = async (name) => {
  const services = await getFulfillmentServices();
  let fulfillmentServiceId = null;
  let result = null;
  services.map((service) => {
    if (service.handle == name) {
      // we clean up 'gid://shopify/Location/46984167469'
      fulfillmentServiceId = service.id.split("/").pop().split("?")[0];
    }
  });

  if (fulfillmentServiceId) {
    result = await getFulfillmentService(fulfillmentServiceId);
  }

  return result;
};

export const createFulfillmentServiceQL = async (changeset) => {
  const query = {
    query: `mutation fulfillmentServiceCreate($name: String!) {
      fulfillmentServiceCreate(name: $name) {
        fulfillmentService {
          id
        }
        userErrors {
          field
          message
        }
      }
    }`,
    variables: {
      name: "fastmag",
    },
  };

  let result = null;
  try {
    const req = await axios.post(`${getUrl()}/graphql.json`, query);
    console.log("req", req.data.data.fulfillmentServiceCreate.userErrors);
  } catch (e) {
    console.log(
      "createFulfillmentService error :",
      _.get(e, "response.data.errors", _.get(e, "response.data.error", e))
    );
  }

  return result;
};

export const createFulfillmentService = async (changeset) => {
  // changeset = {
  //   name: "fastmag",
  //   callback_url: `${HOST}/app/fastmag`,
  //   inventory_management: true,
  //   tracking_support: true,
  //   requires_shipping_method: true,
  //   format: "json"
  // }
  let result = null;
  try {
    const req = await axios.post(`${getUrl()}/fulfillment_services.json`, {
      fulfillment_service: changeset,
    });

    result = req.data.fulfillment_service;
  } catch (e) {
    console.log(
      "createFulfillmentService error :",
      _.get(e, "response.data.errors", _.get(e, "response.data.error", e))
    );
  }

  return result;
};

export const updateFulfillmentService = async (fulfillment_service_id) => {
  const result = await axios.put(
    `${getUrl()}/fulfillment_services/${fulfillment_service_id}.json`,
    {
      fulfillment_service: {
        id: fulfillment_service_id,
        name: "fastmag",
        callback_url: `${HOST}/app/fastmag`,
      },
    }
  );

  return result.data;
};

export const deleteFulfillmentService = async (fulfillment_service_id) => {
  const result = await axios.delete(
    `${getUrl()}/fulfillment_services/${fulfillment_service_id}.json`
  );

  return result.data;
};
