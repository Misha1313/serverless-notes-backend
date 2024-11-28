import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { UpdateCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
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
    item.expires = addDays(new Date(), 90);

    console.log(item.user_id, ':', item.timestamp);
    console.log('tableName', tableName);
    console.log(typeof item.user_id);
    const command = new UpdateCommand({
      TableName: tableName,
      Key: {
        user_id: item.user_id,
        timestamp: parseInt(item.timestamp)
      },
      ConditionExpression: '#t = :t',
      ExpressionAttributeNames: {
        '#t': 'timestamp'
      },
      ExpressionAttributeValues: {
        ':t': parseInt(item.timestamp),
        ':title': item.title,
        ':content': item.content,
        ':cat': item.cat
      },
      UpdateExpression: `
        set
          title = :title,
          content = :content,
          cat = :cat
      `,
      ReturnValues: "ALL_NEW",
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