const _ = require("lodash");
const urljoin = require("url-join");
var BlueBird_Promise = require("bluebird");

const requestModule = require("../modules/request");
const config = require("../config");
const TELS = require("../modules/tels");
const { categories, priorities } = require("../data/TELS_constants");
const TELSurls = require("../data/TELS_urls");

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
    req.log.info("Error: failed to load the Tels main endpoint");
    req.log.info("stack", err.stack);
    req.log.info("message", err.message);
    res.status(err.statusCode).send(err.message);
  }
};

exports.getWorkOrders = async function (req, res) {
  try {
    // instead of the user sending him workorder ids, we need to get the user details and extract the workorders saved from there
    let { workOrders } = req.query;
    req.log.info("query WorkOrders:", workOrders);
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
    req.log.info("Error: failed to get the work orders:");
    req.log.info("err", err);
    req.log.info(err.stack);
    req.log.info(err.message);
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
    req.log.info(response);
    if (_.isArray(response.workOrders)) {
      req.log.info("Details of all the Work Orders:", response.workOrders);
      req.log.info("Number of Work Orders in the Facility:", response.total);
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
    req.log.info(
      "Error: failed to get work orders for entire facility using IDs"
    );
    req.log.info(err.stack);
    req.log.info(err.message);
    res.status(err.statusCode).send(err.message);
  }
};

exports.getFacilityWorkOrdersByName = async function (req, res) {
  try {
    let facilityName = req.query.facilityName;
    req.log.info("Facility Name:", facilityName);
    let TELSfacilityID = await TELS.getTELSfacilityId(
      facilityName,
      req.accessToken
    );

    req.log.info("TELS facility ID:", TELSfacilityID);
    let url = urljoin(config.get("tels").baseUrl, TELSurls.workOrderUrl);
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
    req.log.info("all the WorkOrders", response);
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
    req.log.info(
      "Error: failed to get work orders for entire facility using Facility Name"
    );
    req.log.info(err.stack);
    req.log.info(err.message);
    res.status(err.statusCode).send(err.message);
  }
};

exports.createWorkOrder = async function (req, res) {
  try {
    // req.body has form data that is used to create the work order
    req.log.info("Request Body:", req.body);
    let url = urljoin(config.get("tels").baseUrl, TELSurls.workOrderUrl);

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
      req.log.info("Work Order Creation Successfull");
      req.log.info(
        `Associate the entityIdentifier ${response.entityIdentifier} with the resident who sent the request.`
      );
      dummy.push(response.entityIdentifier);
      res.status(200).json(response);
    }
  } catch (err) {
    req.log.info("Error: failed to create the work order");
    req.log.info(err.stack);
    req.log.info(err.message);
    res.status(err.statusCode).send(err.message);
  }
};

exports.editWorkOrder = async function (req, res) {
  try {
    let workOrders = req.body;
    req.log.info("Request Body:", req.body);
    if (workOrders) {
      const responseStatus = await TELS.editWorkOrder(
        workOrders,
        req.accessToken
      );
      let backURL = req.header("Referer") || "/";
      res.redirect(responseStatus, backURL);
    }
  } catch (err) {
    req.log.info("Error: failed to edit the work order");
    req.log.info(err.stack);
    req.log.info(err.message);
    res.status(err.statusCode).send(err.message);
  }
};
