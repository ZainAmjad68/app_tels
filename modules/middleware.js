const bunyan = require("bunyan");
const { v4: uuidv4 } = require("uuid");
const _ = require("lodash");

const accessTokenModule = require("./accessToken");

function loadLogger(req, res, next) {
  req.log = bunyan.createLogger({
    name: "tels-logger",
    req_id: _.has(req.headers, "X-Amzn-Trace-Id")
      ? req.headers["X-Amzn-Trace-Id"]
      : uuidv4(),
  });
  next();
}

function attachTokenToRequest(req, res, next) {
  req.accessToken = await accessTokenModule.refreshTELSAccessToken();
  next();
}

module.exports = {
  loadLogger: loadLogger,
  attachTokenToRequest: attachTokenToRequest,
};
