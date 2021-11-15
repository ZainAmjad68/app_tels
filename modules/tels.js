const _ = require("lodash");
const urljoin = require("url-join");
const requestModule = require("../modules/request");
const config = require("../config");
const { statuses } = require("../data/TELS_constants");

exports.getWorkOrder = async function (workOrder, access_token) {
  let url = urljoin(
    config.get("tels").baseUrl,
    config.get("tels").workOrderUrl
  );
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
  let url = urljoin(
    config.get("tels").baseUrl,
    config.get("tels").workOrderCategories
  );
  console.log(url);

  let response = await requestModule.sendRequest("GET", url, access_token);
  return response;
};

exports.getTELSfacilityId = async function (facilityName, access_token) {
  let url = urljoin(
    config.get("tels").baseUrl,
    config.get("tels").facilityUrl,
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
  let url = urljoin(config.get("tels").baseUrl, config.get("tels").facilityUrl);

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
  let url = urljoin(
    config.get("tels").baseUrl,
    config.get("tels").workOrderUrl
  );
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
