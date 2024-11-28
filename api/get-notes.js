import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { QueryCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { getResponseHeaders, getUserId } from "./utils.js";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.NOTES_TABLE;

export const handler = async (event) => {
  try {

    const query = event.queryStringParameters;
    const limit = query?.limit || 5;
    const userId = getUserId(event.headers);

    console.log('start:', query?.start? parseInt(query?.start) : undefined);
    const params = {
      TableName: tableName,
      KeyConditionExpression:
        "user_id = :user_id",
      ExpressionAttributeValues: {
        ":user_id": userId,
      },
      ConsistentRead: true,
      Limit: limit,
      ScanIndexForward: false
    };

    if (query?.start) {
      params.ExclusiveStartKey = {
        user_id: userId,
        timestamp: query?.start? parseInt(query?.start) : undefined
      }
    }

    const command = new QueryCommand(params);
  
    const response = await docClient.send(command);
    console.log(response);

    return {
      statusCode: 200,
      headers: getResponseHeaders(),
      body: JSON.stringify(response)
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