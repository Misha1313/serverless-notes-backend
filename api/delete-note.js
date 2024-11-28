import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { getResponseHeaders, getUserId } from "./utils.js";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.NOTES_TABLE;



export const handler = async (event) => {
  try {

    const timestamp = parseInt(event.pathParameters.timestamp);

    const command = new DeleteCommand({
      TableName: tableName,
      Key: {
        user_id: getUserId(event.headers),
        timestamp
      },
    });
  
    const response = await docClient.send(command);
    console.log(response);

    return {
      statusCode: 200,
      headers: getResponseHeaders()
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