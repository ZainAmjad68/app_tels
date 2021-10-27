const accessToken = require("./accessToken");
const request = require("./request");
const _ = require("lodash");

let url = "https://services.tels.net/workOrders/v1/workOrders";

let workOrders = ["53768707", "53768589", "53768584"];

async function getWorkOrder() {
  let access_token = await accessToken.refreshAccessToken();
  console.log("Access Token is:", access_token);

  url = new URL(url);
  let searchParams = url.searchParams;

  for (var workOrder in workOrders) {
    searchParams.set(workOrder, workOrders[workOrder]);
  }

  var new_url = url.toString();
  console.log(new_url);

  let response = await request.get(url, access_token);

  console.log(response);
  if (_.isArray(response.workOrders)) {
    console.log("Number of Work Orders in the Facility:", response.total);
    console.log("Details of all the Work Orders:", response.workOrders);
  }
}

getWorkOrder();
