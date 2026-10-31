import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.APP_REGION });

export const db = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

export const T = {
  users: process.env.USERS_TABLE!,
  products: process.env.PRODUCTS_TABLE!,
  orders: process.env.ORDERS_TABLE!,
};
