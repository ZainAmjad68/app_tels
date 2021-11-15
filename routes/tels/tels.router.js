const express = require("express");
const telsRouter = express.Router();
const md = require("../../modules/middleware");
const telsController = require("../../controllers/tels");

telsRouter.get("/", md.loadLogger, telsController.init);
telsRouter.get("/workOrders", md.loadLogger, telsController.getWorkOrders);
telsRouter.get(
  "/facilityWorkOrdersByID",
  md.loadLogger,
  telsController.getFacilityWorkOrdersByGivingIDdirectly
);
telsRouter.get(
  "/facilityWorkOrdersByName",
  md.loadLogger,
  telsController.getFacilityWorkOrdersByName
);
telsRouter.post(
  "/createWorkOrders",
  md.loadLogger,
  telsController.createWorkOrder
);
telsRouter.post("/editWorkOrders", md.loadLogger, telsController.editWorkOrder);

module.exports = telsRouter;
