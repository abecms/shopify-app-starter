import dotenv from "dotenv";
import _ from "lodash";

dotenv.config();

const { DATABASE } = process.env;
const AWS = require("aws-sdk");

AWS.config.update({
  region: "eu-west-3",
});

const dynamodb = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();

export const createTable = async () => {
  var params = {
    TableName: DATABASE,
    KeySchema: [
      { AttributeName: "store", KeyType: "HASH" },
      { AttributeName: "sk", KeyType: "RANGE" },
    ],
    AttributeDefinitions: [
      { AttributeName: "store", AttributeType: "S" },
      { AttributeName: "sk", AttributeType: "S" },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 10,
      WriteCapacityUnits: 10,
    },
  };

  try {
    const data = await dynamodb.createTable(params).promise();
    console.log("CreateTable Success");
    console.log(data);

    return data;
  } catch (err) {
    console.log("CreateTable Failure", err.message);

    return false;
  }
};

// export const addOrUpdateItem = async (shopId, item) => {
//   let item = await getItem({ store: shopId });

//   if (item) {
//     const key = { store: shopId };

//     var changeset = {
//       UpdateExpression: "set #id1 = :x",
//       ExpressionAttributeNames: { "#id1": "fastmag" },
//       ExpressionAttributeValues: {
//         ":x": {
//           inventory: { lastCall: lastCall },
//         },
//       },
//     };

//     const item = await updateItem(key, changeset);
//   } else {
//     item = {
//       store: shopId,
//       ...item
//     }
//   }

// }

export const addItem = async (item) => {
  var params = {
    TableName: DATABASE,
    Item: item,
  };

  try {
    const data = await docClient.put(params).promise();
    //console.log("addItem Success");

    return data;
  } catch (err) {
    console.log("addItem Failure", err.message);

    return false;
  }
};

export const getItem = async (key) => {
  var params = {
    TableName: DATABASE,
    Key: key,
  };

  //console.log('item', params);

  try {
    const data = await docClient.get(params).promise();
    // console.log("getItem Success");
    // console.log(data);

    return data;
  } catch (err) {
    console.log("getItem Failure", err.message);

    return false;
  }
};

export const updateItem = async (key, changeset) => {
  const params = {
    TableName: DATABASE,
    Key: key,
    ReturnValues: "ALL_NEW",
    ...changeset,
  };

  //console.log("update", params);

  try {
    const data = await docClient.update(params).promise();
    //console.log("updateItem Success");
    //console.log(data);

    return data;
  } catch (err) {
    console.log("updateItem Failure", err.message);

    return false;
  }
};

export const removeItem = async (item) => {
  var params = {
    TableName: DATABASE,
    Key: {
      store: "izacstore",
      title: "title izacstore",
    },
    ConditionExpression: "info.rating <= :val",
    ExpressionAttributeValues: {
      ":val": 5.0,
    },
  };

  try {
    const data = await docClient.delete(params).promise();
    console.log("Success");
    console.log(data);

    return data;
  } catch (err) {
    console.log("Failure", err.message);

    return false;
  }
};

export const deleteTable = async () => {
  var params = {
    TableName: DATABASE,
  };

  try {
    const data = await dynamodb.deleteTable(params).promise();
    console.log("Success");
    console.log(data);

    return data;
  } catch (err) {
    console.log("Failure", err.message);

    return false;
  }
};

export const query = async (params) => {
  params = {
    TableName: DATABASE,
    ...params,
  };

  try {
    const data = await docClient.query(params).promise();
    //console.log("Success");
    //console.log(data);

    return data;
  } catch (err) {
    console.log("Failure", err.message);

    return false;
  }
};

export const scan = async (searchQuery) => {
  var params = {
    TableName: process.env.PRODUCTS_TABLE,
    FilterExpression: "contains (title, :title)",
    ExpressionAttributeValues: {
      ":title": searchQuery,
    },
  };

  try {
    const data = await docClient.scan(params).promise();
    console.log("Success");
    console.log(data);

    return data;
  } catch (err) {
    console.log("Failure", err.message);

    return false;
  }
};

export const getLastCall = async (shopId) => {
  const key = { store: shopId, sk: "settings" };
  const item = await getItem(key);
  //console.log('Store', item);

  if (!_.isEmpty(item) && _.get(item, "Item.fastmag.inventory.lastCall")) {
    return _.get(item, "Item.fastmag.inventory.lastCall");
  }

  return null;
};

export const setLastCall = async (shopId, lastCall) => {
  const key = { store: shopId, sk: "settings" };
  let item = await getItem(key);

  try {
    const changeset = {
      UpdateExpression: "SET fastmag.inventory = :x",
      ExpressionAttributeValues: { ":x": { lastCall: lastCall } },
    };
    item = await updateItem(key, changeset);
  } catch (e) {
    const changeset = {
      UpdateExpression:
        "SET fastmag.inventory = if_not_exists(fastmag.inventory, :x)",
      ExpressionAttributeValues: { ":x": { lastCall: lastCall } },
    };
    item = await updateItem(key, changeset);
  }

  return item;
};

export const log = async (shop, action, data) => {
  const now = new Date().toISOString().replace(/\..+/, "");
  const sk = `log#action#${action}-date#${now}`;

  try {
    await addItem({
      store: shop,
      sk: sk,
      createdAt: now,
      data: data,
    });
  } catch (e) {
    console.log("erreur action ", action, e);
  }

  return sk;
};
