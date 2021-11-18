const _ = require("lodash");
const urljoin = require("url-join");
var AWS = require("aws-sdk");

const requestModule = require("../modules/request");
const config = require("../config");
const { statuses } = require("../data/TELS_constants");
const TELSurls = require("../data/TELS_urls");

var docClient = new AWS.DynamoDB.DocumentClient();

var table = "tels_workorders";

exports.getWorkOrder = async function (workOrder, access_token) {
  let url = urljoin(config.get("tels").baseUrl, TELSurls.workOrderUrl);
  url = `${url}/${workOrder}`;
  console.log(url);

  let response = await requestModule.sendRequest("GET", url, access_token);
  let relevantData = _.pick(response, [
    "authorizationNumber",
    "title",
    "description",
    "createdWhen",
    "whereLocated",
    "status",
    "priority",
    "category",
  ]);

  /*  if (relevantData.status === 3) {
    return null; // if work order completed, don't show it
  } else {*/
  const findStatus = statuses.find(
    (status) => status.value === relevantData.status
  );
  relevantData.status = findStatus.name;
  return relevantData;
  /*}*/
};

exports.getWorkOrderCategories = async function (access_token) {
  let url = urljoin(config.get("tels").baseUrl, TELSurls.workOrderCategories);
  console.log(url);

  let response = await requestModule.sendRequest("GET", url, access_token);
  return response;
};

exports.getWorkOrdersByResidentID = async function (ResidentID) {
  let workOrders;
  var params = {
    TableName: table,
    ExpressionAttributeValues: {
      ":ResidentID": ResidentID,
    },
    ExpressionAttributeNames: {
      "#ResidentID": "ResidentID",
    },
    KeyConditionExpression: "#ResidentID = :ResidentID",
  };

  try {
    const awsRequest = await docClient.query(params);
    const result = await awsRequest.promise();
    console.log("Result fetched from AWS:", result);
    workOrders = _.map(result.Items, "WorkOrder");
    console.log("WorkOrders fetched from AWS:", workOrders);
  } catch (err) {
    console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
    return err;
  }

  return workOrders;
};

exports.putWorkOrderInDB = async function (ResidentID, WorkOrder) {
  var params = {
    TableName: table,
    Item: {
      ResidentID: ResidentID,
      WorkOrder: WorkOrder,
    },
  };

  try {
    console.log("Adding a new item...");
    const awsRequest = await docClient.put(params);
    await awsRequest.promise();
    console.log("Data added into AWS Successfully");
  } catch (err) {
    console.log(
      "Unable to Add Data into DynamoDB. Error:",
      JSON.stringify(err, null, 2)
    );
    return err;
  }
  return true;
};

exports.getTELSfacilityId = async function (facilityName, access_token) {
  let url = urljoin(
    config.get("tels").baseUrl,
    TELSurls.facilityUrl,
    config.get("caremergeTELSid"),
    "facilities"
  );
  console.log(url);
  let response = await requestModule.sendRequest("GET", url, access_token);
  let userFacility = _.find(response, (facility) => {
    return facility.name === facilityName;
  });
  return userFacility.businessUnitId;
};

async function getAllFacilities(accessToken) {
  let url = urljoin(config.get("tels").baseUrl, TELSurls.facilityUrl);

  url = `${url}/${config.get("caremergeTELSid")}/facilities`;
  let response = await requestModule.sendRequest("GET", url, accessToken);

  console.log(response);
  if (_.isArray(response)) {
    return response;
  }
}

exports.getUserFacility = async function (facilityName, accessToken) {
  let allFacilities = await getAllFacilities(accessToken);
  let userFacility = _.find(allFacilities, (facility) => {
    return facility.name === facilityName;
  });
  return userFacility.businessUnitId;
};

exports.editWorkOrder = async function (workOrders, access_token) {
  let url = urljoin(config.get("tels").baseUrl, TELSurls.workOrderUrl);
  url = `${url}/${workOrders.authorizationNumber}`;
  console.log(url);
  delete workOrders.authorizationNumber;

  let data = [];
  for (var workOrder of Object.keys(workOrders)) {
    data.push({
      value: workOrders[workOrder],
      path: workOrder,
      op: "replace",
    });
  }

  let response = await requestModule.sendRequest(
    "PATCH",
    url,
    access_token,
    data
  );

  return response.statusCode;
};
