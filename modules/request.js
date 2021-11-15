const rp = require("request-promise");

let options = {
  POST: { headers: true },
  GET: { gzip: true, headers: true },
  PATCH: {
    resolveWithFullResponse: true,
    headers: true,
  },
  SIMPLEPOST: {},
};

async function sendRequest(httpMethod, url, accessToken, data) {
  try {
    // options that are common for every request
    let httpOptions = {
      method: httpMethod,
      uri: url,
      json: true,
    };
    let attributes = options[httpMethod];
    // append options that are different for each request type
    Object.assign(httpOptions, attributes);
    if (httpOptions["headers"] !== undefined) {
      httpOptions.headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      };
    }
    if (data !== undefined) {
      httpOptions.body = data;
    }
    return await rp(httpOptions);
  } catch (err) {
    if (err.name === "StatusCodeError") {
      // Not Authorized error, maybe refresh the user's auth token?
      if (err.statusCode === 401) {
        err.message = "Refresh Token was rejected.";
        return err;
      } else if (err.statusCode === 404) {
        // Not Found, the server was unable to locate the resource
        err.message = "Invalid Endpoint. Unable to Locate the Resource.";
        return err;
      } else if (err.statusCode === 500) {
        // Interal Server, something went wrong with the server itself!
        err.message = "Internal Error. Server is Down.";
        return err;
      }
    } else if (err.name === "RequestError") {
      // something went wrong in the process of making the request
      // maybe the internet connection dropped
      err.message = "Unable to make the request. Check Internet Connection.";
      return err;
    }
  }
}

module.exports = {
  sendRequest: sendRequest,
};
