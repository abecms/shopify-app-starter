import axios from "axios";
import dotenv from "dotenv";
import _ from "lodash";
import Bottleneck from "bottleneck";
import { getUrl, getNextPage } from "./query";

dotenv.config();

const { SHOP, ACCESS_TOKEN } = process.env;

/**
 *  GET /admin/api/2020-07/collections/{collection_id}.json
    Retrieves a single collection

    GET /admin/api/2020-07/collections/{collection_id}/products.json
    Retrieve a list of products belonging to a collection
 */

export const getCollection = async (id) => {
  const result = await axios.get(`${getUrl()}/collections/${id}.json`);

  return result.data.collection;
};

export const getProductsCollection = async (id) => {
  const result = await axios.get(`${getUrl()}/collections/${id}/products.json`);

  return result.data.products;
};
