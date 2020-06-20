import axios from "axios";
import dotenv from "dotenv";
import _ from "lodash";

import { getUrl } from "./query";

dotenv.config();

/**
 *  GET /admin/api/2020-04/gift_cards.json
    Retrieves a list of gift cards

    GET /admin/api/2020-04/gift_cards/{gift_card_id}.json
    Retrieves a single gift card

    GET /admin/api/2020-04/gift_cards/count.json?status=enabled
    Retrieves a count of gift cards

    POST /admin/api/2020-04/gift_cards.json
    Creates a gift card

    PUT /admin/api/2020-04/gift_cards/{gift_card_id}.json
    Updates an existing gift card

    POST /admin/api/2020-04/gift_cards/{gift_card_id}/disable.json
    Disables a gift card

    GET /admin/api/2020-04/gift_cards/search.json?query=mnop
    Searches for gift cards
*/

export const getGiftCards = async () => {
  const result = await axios.get(`${getUrl()}/gift_cards.json`);

  return result.data.gift_cards;
};

export const getGiftCard = async (giftCardId) => {
  const result = await axios.get(`${getUrl()}/gift_cards/${giftCardId}.json`);

  return result.data.gift_card;
};

export const createGiftCard = async (changeset) => {
  // changeset = {
  //   "note": "This is a note",
  //   "initial_value": 100.0,
  //   "code": "ABCDEFGHIJKLMNOP",
  //   "template_suffix": "gift_cards.liquid"
  // }
  let result = null;
  console.log("changeset createGiftCard", changeset);

  try {
    const req = await axios.post(`${getUrl()}/gift_cards.json`, {
      gift_card: changeset,
    });
    result = req.data;
  } catch (e) {
    console.log(
      "createGiftCard error :",
      _.get(e, "response.data.errors", _.get(e, "response.data.error", e))
    );
  }

  return result;
};

export const updateGiftCard = async (giftCardId, changeset) => {
  changeset = {
    gift_card: {
      id: giftCardId,
      ...changeset,
    },
  };
  const result = await axios.put(
    `${getUrl()}/gift_cards/${giftCardId}.json`,
    changeset
  );

  return result.data;
};

export const disableGiftCard = async (giftCardId) => {
  let result = null;
  try {
    const req = await axios.post(
      `${getUrl()}/gift_cards/${giftCardId}/disable.json`
    );

    result = req.data;
  } catch (e) {
    console.log(
      "disableGiftCard error :",
      _.get(e, "response.data.errors", _.get(e, "response.data.error", e))
    );
  }

  return result;
};
