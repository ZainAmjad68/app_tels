const request = require("./request");

let url = "https://services.tels.net/auth/token/refresh";

// to get a new token, we have to provide them the refresh token
let access_token = {
  refreshToken:
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdXRobWV0aG9kIjoiVHJ1c3QiLCJnaXZlbl9uYW1lIjoiQ2FyZW1lcmdlIiwiZmFtaWx5X25hbWUiOiJJbnRlZ3JhdGlvbiIsIkRTOkFjY291bnRJRCI6IjEyMDEyOTQiLCJEUzpVc2VyIjoiN2MwYzZmYzYtNzQyMS00MjVjLWIzYzktZWM1YzIyYzNjMWU1IiwiRFM6UGVyc29uSWQiOiIyNjA1MDU1IiwiRFM6UGVyc29uYSI6IjgiLCJEUzpSb2xlcyI6IjAiLCJEUzpGYWNpbGl0eUlEcyI6IjEzODI2NiIsImlzcyI6InNlcnZpY2VzLnRlbHMubmV0IiwiYXVkIjoic2VydmljZXMudGVscy5uZXQiLCJleHAiOjE2MTM2Njc0MzgsIm5iZiI6MTYxMzY2NzI1OH0.c5RgpI_7okku4-CvvAQGoRJv_sVOMx2CrAqP5muV8z8",
};

async function refreshAccessToken() {
  // use something like express-session or node-cache to keep the data saved during a client's interaction and get from there instead of making a new request everytime
  let response = await request.simplePost(url, access_token);
  return response.accessToken;
}

module.exports = {
  refreshAccessToken: refreshAccessToken,
};
