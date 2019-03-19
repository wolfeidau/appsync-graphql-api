import AWS from "aws-sdk"
import { handler } from "./appsync"

const ddbClient = new AWS.DynamoDB({
  endpoint: "http://localhost:8000",
})

describe("handler", () => {

  beforeAll(async () => {

    jest.setTimeout(60000)

    const tableName = process.env.TICKETS_TABLE_NAME || ""

    try {
      await ddbClient.deleteTable({TableName: tableName}).promise()
    } catch (err) {
      if (err && err.code !== "ResourceNotFoundException") {
        throw err
      }
    }

    await ddbClient.waitFor("tableNotExists", {
      TableName: tableName,
    }).promise()

    const createParams: AWS.DynamoDB.Types.CreateTableInput = {
      TableName: tableName,
      AttributeDefinitions: [
        {AttributeName: "customerId", AttributeType: "S"},
        {AttributeName: "ticketId", AttributeType: "S"},
      ],
      KeySchema: [
        {AttributeName: "customerId", KeyType: "HASH"},
        {AttributeName: "ticketId", KeyType: "SORT"},
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 2,
        WriteCapacityUnits: 2,
      },
    }

    try {
      await ddbClient.createTable(createParams).promise()
    } catch (err) {
      if (err && err.code !== "ResourceInUseException") {
        throw err
      }
    }

    await ddbClient.waitFor("tableExists", {
      TableName: tableName,
    }).promise()

    const putParams: AWS.DynamoDB.Types.PutItemInput = {
      TableName: tableName,
      Item: {
        customerId: {S: "c41f543d-5299-4e02-94c4-635e87bad7d4"},
        eventId: {S: "2e8b086e-89d7-4d9a-b0fc-4f96f819ebea"},
        created: {S: "2019-01-24T02:28:10.161Z"},
      },
    }

    await ddbClient.putItem(putParams).promise()
  })

  test("listTickets", async () => {
    const response = await handler({
      identity: {},
      arguments: {customerId: "c41f543d-5299-4e02-94c4-635e87bad7d4"},
      field: "listTickets",
    })

    expect(response).toEqual({items: [
      {
        customerId: "c41f543d-5299-4e02-94c4-635e87bad7d4",
        eventId: "2e8b086e-89d7-4d9a-b0fc-4f96f819ebea",
        created: "2019-01-24T02:28:10.161Z",
      },
    ], nextToken: undefined})
  })
})
