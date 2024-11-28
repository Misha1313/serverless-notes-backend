import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { QueryCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { getResponseHeaders, getUserId } from "./utils.js";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.NOTES_TABLE;

export const handler = async (event) => {
  try {

    const query = event.queryStringPatameters;
    const limit = query?.limit || 5;
    const userId = getUserId(event.headers);

    const note_id = decodeURIComponent(event.pathParameters.note_id);

    const command = new QueryCommand({
      TableName: tableName,
      IndexName: 'note_id-index',
      KeyConditionExpression:
        "note_id = :note_id",
      ExpressionAttributeValues: {
        ":note_id": note_id,
      },
      Limit: 1
      
    });
  
    const response = await docClient.send(command);
    console.log('response', response);

    if(response?.Items?.length > 0) {
      return {
        statusCode: 200,
        headers: getResponseHeaders(),
        body: JSON.stringify(response.Items)
      }
    } else {
      return {
        statusCode: 404,
        headers: getResponseHeaders()
      }
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