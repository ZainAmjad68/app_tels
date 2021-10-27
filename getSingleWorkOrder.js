const accessToken = require("./accessToken");
const request = require("./request");
const _ = require("lodash");

// these would be associated with the Resident on the backend
let workOrders = ["53768707", "53768589", "53768584"];

async function getWorkOrder(workOrder) {
  let url = "https://services.tels.net/workOrders/v1/workOrders";
  let access_token = await accessToken.refreshAccessToken();
  console.log("Access Token is:", access_token);

  url = `${url}/${workOrder}`;

  console.log(url);

  let response = await request.get(url, access_token);

  return _.pick(response, ["title", "description", "createdWhen"]);
}

async function printAllWorkOrdersOfResident() {
  let allWorkOrderInfo = [];

  for (const workOrder of workOrders) {
    const resp = await getWorkOrder(workOrder);
    allWorkOrderInfo.push(resp);
  }

  console.log(allWorkOrderInfo);
}

printAllWorkOrdersOfResident();
