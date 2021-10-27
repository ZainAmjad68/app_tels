const rp = require("request-promise");

async function get(url, accessToken) {
  return await rp({
    method: "GET",
    uri: url,
    headers: {
      Authorization: "Bearer " + accessToken,
    },
    json: true,
    gzip: true,
  });
}

async function post(url, accessToken, data) {
  return await rp({
    method: "POST",
    uri: url,
    body: data,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + accessToken,
    },
    json: true,
  });
}

async function simplePost(url, data) {
  return await rp({
    method: "POST",
    uri: url,
    body: data,
    json: true,
    gzip: true,
  });
}

module.exports = {
  get: get,
  post: post,
  simplePost: simplePost,
};
