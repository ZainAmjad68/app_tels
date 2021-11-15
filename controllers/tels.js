const _ = require("lodash");
const urljoin = require("url-join");
var BlueBird_Promise = require("bluebird");

const requestModule = require("../modules/request");
const config = require("../config");
const TELS = require("../modules/tels");
const { categories, priorities } = require("../data/TELS_constants");

// these would be associated with the Resident on the backend
let dummy = ["53768707", "53998646", "54058430", "53580013", "54133730"];

exports.init = async function (req, res) {
  try {
    let workOrders = dummy;
    req.log.info(dummy);
    //let categories = await TELS.getWorkOrderCategories(accessToken);
    let workOrderDetails = await BlueBird_Promise.map(
      workOrders,
      (workOrder) => {
        return TELS.getWorkOrder(workOrder, req.accessToken);
      },
      {
        concurrency: 3,
      }
    );
    res.render("pages/index", {
      workOrderDetails,
      categories,
      priorities,
    });
  } catch (err) {
    console.log("Error: failed to load the Tels main endpoint");
    console.log("stack", err.stack);
    console.log("message", err.message);
    res.status(err.statusCode).send(err.message);
  }
};

exports.getWorkOrders = async function (req, res) {
  try {
    // instead of the user sending him workorder ids, we need to get the user details and extract the workorders saved from there
    let { workOrders } = req.query;
    console.log("query WorkOrders:", workOrders);
    if (_.isArray(workOrders)) {
      // more comprehensive way to handle the workOrders and any associated errors
      let workOrderDetails = await Promise.allSettled(
        _.map(workOrders, async (workOrder) => {
          return TELS.getWorkOrder(workOrder, req.accessToken);
        })
      );
      const rejectedWorkOrders = _.filter(workOrderDetails, {
        status: "rejected",
      });
      if (rejectedWorkOrders.length) {
        return res.status(400).json(rejectedWorkOrders);
      }
      return res.status(200).json(_.map(workOrderDetails, "value"));
    }
  } catch (err) {
    console.log("Error: failed to get the work orders:");
    console.log("err", err);
    console.log(err.stack);
    console.log(err.message);
    res.status(err.statusCode).send(err.message);
  }
};

exports.getFacilityWorkOrdersByGivingIDdirectly = async function (req, res) {
  try {
    // the facility id of TELS is provided in the req.query here, currently there's only one but will be many more in future
    let url = urljoin(
      config.get("tels").baseUrl,
      config.get("tels").workOrderUrl
    );
    url = new URL(url);
    let searchParams = url.searchParams;
    for (var property in req.query) {
      searchParams.set(property, req.query[property]);
    }
    let response = await requestModule.sendRequest("GET", url, req.accessToken);
    while (response.nextPageKey) {
      searchParams.set("pageKey", response.nextPageKey);
      let nextPageData = await requestModule.sendRequest(
        "GET",
        url,
        req.accessToken
      );
      response.workOrders = [
        ...response.workOrders,
        ...nextPageData.workOrders,
      ];
      response.total = nextPageData.total;
      response.nextPageKey = nextPageData.nextPageKey;
    }
    console.log(response);
    if (_.isArray(response.workOrders)) {
      console.log("Details of all the Work Orders:", response.workOrders);
      console.log("Number of Work Orders in the Facility:", response.total);
    }
    let workOrderData = _.map(response.workOrders, (workOrder) => {
      return _.pick(workOrder, [
        "authorizationNumber",
        "title",
        "description",
        "whereLocated",
        "createdWhen",
      ]);
    });
    res.status(200).json(workOrderData);
  } catch (err) {
    console.log(
      "Error: failed to get work orders for entire facility using IDs"
    );
    console.log(err.stack);
    console.log(err.message);
    res.status(err.statusCode).send(err.message);
  }
};

exports.getFacilityWorkOrdersByName = async function (req, res) {
  try {
    let facilityName = req.query.facilityName;
    console.log("Facility Name:", facilityName);
    let TELSfacilityID = await TELS.getTELSfacilityId(
      facilityName,
      req.accessToken
    );

    console.log("TELS facility ID:", TELSfacilityID);
    let url = urljoin(
      config.get("tels").baseUrl,
      config.get("tels").workOrderUrl
    );
    url = new URL(url);
    let searchParams = url.searchParams;
    searchParams.set("businessUnitId", TELSfacilityID);

    let response = await requestModule.sendRequest("GET", url, req.accessToken);
    while (response.nextPageKey) {
      searchParams.set("pageKey", response.nextPageKey);
      let nextPageData = await requestModule.sendRequest(
        "GET",
        url,
        req.accessToken
      );
      response.workOrders = [
        ...response.workOrders,
        ...nextPageData.workOrders,
      ];
      response.total = nextPageData.total;
      response.nextPageKey = nextPageData.nextPageKey;
    }
    console.log("all the WorkOrders", response);
    let workOrderData = _.map(response.workOrders, (workOrder) => {
      return _.pick(workOrder, [
        "authorizationNumber",
        "title",
        "description",
        "whereLocated",
        "createdWhen",
      ]);
    });
    res.status(200).json(workOrderData);
  } catch (err) {
    console.log(
      "Error: failed to get work orders for entire facility using Facility Name"
    );
    console.log(err.stack);
    console.log(err.message);
    res.status(err.statusCode).send(err.message);
  }
};

exports.createWorkOrder = async function (req, res) {
  try {
    // req.body has form data that is used to create the work order
    console.log("Request Body:", req.body);
    let url = urljoin(
      config.get("tels").baseUrl,
      config.get("tels").workOrderUrl
    );

    let facilityId = await TELS.getUserFacility(
      "TELS Integration Test",
      req.accessToken
    );
    req.body.facilityId = facilityId;

    let response = await requestModule.sendRequest(
      "POST",
      url,
      req.accessToken,
      req.body
    );
    // after the work order has been created on TELS, need to save/associate entryIdentifier with CM user
    if (response.wasSuccessful) {
      console.log("Work Order Creation Successfull");
      console.log(
        `Associate the entityIdentifier ${response.entityIdentifier} with the resident who sent the request.`
      );
      dummy.push(response.entityIdentifier);
      res.status(200).json(response);
    }
  } catch (err) {
    console.log("Error: failed to create the work order");
    console.log(err.stack);
    console.log(err.message);
    res.status(err.statusCode).send(err.message);
  }
};

exports.editWorkOrder = async function (req, res) {
  try {
    let workOrders = req.body;
    console.log("Request Body:", req.body);
    if (workOrders) {
      const responseStatus = await TELS.editWorkOrder(
        workOrders,
        req.accessToken
      );
      let backURL = req.header("Referer") || "/";
      res.redirect(responseStatus, backURL);
    }
  } catch (err) {
    console.log("Error: failed to edit the work order");
    console.log(err.stack);
    console.log(err.message);
    res.status(err.statusCode).send(err.message);
  }
};
