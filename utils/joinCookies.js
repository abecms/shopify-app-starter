import { getCookies } from "cookies-next";
import _ from "lodash";

const joinCookies = (ctx) => {
    return _(getCookies(ctx))
      .map((value, key) => {
        return [key, value].join("=");
      })
      .join(";");
};

export default joinCookies;