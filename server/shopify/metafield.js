import axios from "axios";
import dotenv from "dotenv";
import _ from "lodash";
import Bottleneck from "bottleneck";
import { getUrl, getNextPage } from "./query";

dotenv.config();

const { SHOP, ACCESS_TOKEN } = process.env;

/**
 *  GET /admin/api/2020-07/metafields.json
    Retrieves a list of metafields that belong to a resource

    GET /admin/api/2020-07/metafields.json?metafield[owner_id]=850703190&metafield[owner_resource]=product_image
    Retrieves a list of metafields that belong to a Product Image resource

    GET /admin/api/2020-07/metafields/count.json
    Retrieves a count of a resource's metafields

    GET /admin/api/2020-07/metafields/{metafield_id}.json
    Retrieves a single metafield from a resource by its ID

    POST /admin/api/2020-07/metafields.json
    Creates a new metafield for a resource

    PUT /admin/api/2020-07/metafields/{metafield_id}.json
    Updates a metafield

    DELETE /admin/api/2020-07/metafields/{metafield_id}.json
    Deletes a metafield by its ID
 */
