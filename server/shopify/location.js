import axios from "axios";
import dotenv from "dotenv";
import _ from "lodash";

import { getUrl } from "./query";

dotenv.config();

/**
 *  GET /admin/api/2020-04/locations.json
    Retrieves a list of locations

    GET /admin/api/2020-04/locations/#{location_id}.json
    Retrieves a single location by its ID

    GET /admin/api/2020-04/locations/count.json
    Retrieves a count of locations

    GET /admin/api/2020-04/locations/#{location_id}/inventory_levels.json
    Retrieves a list of inventory levels for a location.
 */

export const getLocations = async () => {
  const result = await axios.get(`${getUrl()}/locations.json`);

  return result.data;
};
