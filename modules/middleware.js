const bunyan = require("bunyan");
const { v4: uuidv4 } = require("uuid");
const _ = require("lodash");

const accessTokenModule = require("./accessToken");

let accessToken;

function loadLogger(req, res, next) {
  req.log = bunyan.createLogger({
    name: "tels-logger",
    req_id: _.has(req.headers, "X-Amzn-Trace-Id")
      ? req.headers["X-Amzn-Trace-Id"]
      : uuidv4(),
    serializers: bunyan.stdSerializers.err,
  });
  next();
}

async function attachTokenToRequest(req, res, next) {
  if (!accessToken) {
    accessToken = await accessTokenModule.refreshTELSAccessToken();
  }
  req.accessToken = accessToken;
  next();
}

module.exports = {
  loadLogger: loadLogger,
  attachTokenToRequest: attachTokenToRequest,
};
