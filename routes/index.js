// ./lib/routes/index.js
const express = require("express");
const router = express.Router();
const tels = require("./tels/tels.router");
router.use("/tels/v1", tels);
// Add more routes here if you want!
module.exports = router;
