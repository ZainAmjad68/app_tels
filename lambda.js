const serverlessExpress = require("@vendia/serverless-express");
const app = require("./app");

let serverlessExpressInstance;

function connectToDynamoDB() {
  return new Promise((resolve) => {
    setTimeout(() => resolve("Connected to Dynamo DB"), 500);
  });
}

async function setup(event, context) {
  const connection = await connectToDynamoDB();
  console.log(connection);
  serverlessExpressInstance = serverlessExpress({ app });
  return serverlessExpressInstance(event, context);
}

function handler(event, context) {
  global.request_id = context.awsRequestId;
  if (serverlessExpressInstance)
    return serverlessExpressInstance(event, context);

  return setup(event, context);
}

exports.handler = handler;
