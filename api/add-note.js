import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { getResponseHeaders, getUserId, getUserName } from "./utils.js";
import { uuid } from 'uuidv4';
import { addDays } from "date-fns";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.NOTES_TABLE;

export const handler = async (event) => {
  try {
    const item = JSON.parse(event.body).Item;
    item.user_id = getUserId(event.headers);
    item.user_name = getUserName(event.headers);
    item.note_id = item.user_id + ':' + uuid();
    item.timestamp = new Date().getTime();
    item.expires = addDays(new Date(), 90).getTime();

    const command = new PutCommand({
      TableName: tableName,
      Item: item,
    });
  
    const response = await docClient.send(command);
    console.log(response);

    return {
      statusCode: 200,
      headers: getResponseHeaders(),
      body: JSON.stringify(item)
    }
  } catch (error) {
    console.log('Error', error);
    return {
      statusCode: error.statusCode || 500,
      headers: getResponseHeaders(),
      body: JSON.stringify({
        error: error.name || 'Exception',
        message: error.message || 'Unknown error'
      })
    }

  }
};