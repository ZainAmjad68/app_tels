var convict = require("convict");

module.exports = convict({
  environment: {
    doc: "Specifies the running environment of tels-integration-api",
    format: String,
    env: "NODE_ENV",
    default: "development",
  },
  caremergeTELSid: {
    doc: "Person ID given to Caremerge to use TEL's services.",
    format: String,
    default: "2605055",
  },
  tels: {
    baseUrl: {
      doc: "TEL's environment url.",
      format: String,
      default: "https://services.tels.net",
    },
    refreshToken: {
      doc: "TEL's provided refresh token used to get access token",
      format: String,
      default:
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdXRobWV0aG9kIjoiVHJ1c3QiLCJnaXZlbl9uYW1lIjoiQ2FyZW1lcmdlIiwiZmFtaWx5X25hbWUiOiJJbnRlZ3JhdGlvbiIsIkRTOkFjY291bnRJRCI6IjEyMDEyOTQiLCJEUzpVc2VyIjoiN2MwYzZmYzYtNzQyMS00MjVjLWIzYzktZWM1YzIyYzNjMWU1IiwiRFM6UGVyc29uSWQiOiIyNjA1MDU1IiwiRFM6UGVyc29uYSI6IjgiLCJEUzpSb2xlcyI6IjAiLCJEUzpGYWNpbGl0eUlEcyI6IjEzODI2NiIsImlzcyI6InNlcnZpY2VzLnRlbHMubmV0IiwiYXVkIjoic2VydmljZXMudGVscy5uZXQiLCJleHAiOjE2MTM2Njc0MzgsIm5iZiI6MTYxMzY2NzI1OH0.c5RgpI_7okku4-CvvAQGoRJv_sVOMx2CrAqP5muV8z8",
    },
  },
  app: {
    name: {
      doc: "Tha name of the integration app",
      format: String,
      default: "TELS Integration App",
    },
  },
});
