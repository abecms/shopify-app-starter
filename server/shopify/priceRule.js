import axios from "axios";
import dotenv from "dotenv";
import _ from "lodash";

import { getUrl } from "./query";

dotenv.config();

/**
 *  POST /admin/api/2020-07/price_rules.json
    Creates a price rule

    PUT /admin/api/2020-07/price_rules/{price_rule_id}.json
    Updates an existing a price rule

    GET /admin/api/2020-07/price_rules.json
    Retrieves a list of price rules

    GET /admin/api/2020-07/price_rules/{price_rule_id}.json
    Retrieves a single price rule

    GET /admin/api/2020-07/price_rules/count.json
    Retrieves a count of all price rules

    DELETE /admin/api/2020-07/price_rules/{price_rule_id}.json
    Remove an existing PriceRule
*/

// export const getGiftCards = async () => {
//   const result = await axios.get(`${getUrl()}/price_rules.json`);

//   return result.data.gift_cards;
// };

// export const getGiftCard = async (giftCardId) => {
//   const result = await axios.get(`${getUrl()}/gift_cards/${giftCardId}.json`);

//   return result.data.gift_card;
// };

export const createPriceRule = async (changeset) => {
  //   changeset = {
  //     "title": "15OFFCOLLECTION",
  //     "target_type": "line_item",
  //     "target_selection": "entitled",
  //     "allocation_method": "across",
  //     "value_type": "percentage",
  //     "value": "-15.0",
  //     "customer_selection": "all",
  //     "starts_at": "2020-01-19T17:59:10Z"
  //   }
  let result = null;
  console.log("changeset createPriceRule", changeset);

  try {
    const req = await axios.post(`${getUrl()}/price_rules.json`, {
      price_rule: changeset,
    });
    result = req.data;
  } catch (e) {
    console.log(
      "createPriceRule error :",
      _.get(e, "response.data.errors", _.get(e, "response.data.error", e))
    );
  }

  return result;
};

// export const updateGiftCard = async (giftCardId, changeset) => {
//   changeset = {
//     gift_card: {
//       id: giftCardId,
//       ...changeset,
//     },
//   };
//   const result = await axios.put(
//     `${getUrl()}/gift_cards/${giftCardId}.json`,
//     changeset
//   );

//   return result.data;
// };

// export const disableGiftCard = async (giftCardId) => {
//   const result = await axios.post(
//     `${getUrl()}/gift_cards/${giftCardId}/disable.json`
//   );

//   return result.data;
// };
