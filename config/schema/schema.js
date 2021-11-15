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
    OAuthUrl: {
      doc: "TEL's OAuth route",
      format: String,
      default: "auth/token/refresh",
    },
    facilityUrl: {
      doc: "TEL's get facility's route",
      format: String,
      default: "customers/v1/contacts",
    },
    workOrderUrl: {
      doc: "TEL's Customer account route",
      format: String,
      default: "workOrders/v1/workOrders",
    },
    workOrderCategories: {
      doc: "TEL's Customer account transactions",
      format: String,
      default: "workOrders/v1/categories",
    },
    workOrderPriorities: {
      doc: "TEL's Customer account transactions",
      format: String,
      default: "workOrders/v1/priorities",
    },
    refreshToken: {
      doc: "TEL's provided refresh token used to get access token",
      format: String,
      default:
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdXRobWV0aG9kIjoiVHJ1c3QiLCJnaXZlbl9uYW1lIjoiQ2FyZW1lcmdlIiwiZmFtaWx5X25hbWUiOiJJbnRlZ3JhdGlvbiIsIkRTOkFjY291bnRJRCI6IjEyMDEyOTQiLCJEUzpVc2VyIjoiN2MwYzZmYzYtNzQyMS00MjVjLWIzYzktZWM1YzIyYzNjMWU1IiwiRFM6UGVyc29uSWQiOiIyNjA1MDU1IiwiRFM6UGVyc29uYSI6IjgiLCJEUzpSb2xlcyI6IjAiLCJEUzpGYWNpbGl0eUlEcyI6IjEzODI2NiIsImlzcyI6InNlcnZpY2VzLnRlbHMubmV0IiwiYXVkIjoic2VydmljZXMudGVscy5uZXQiLCJleHAiOjE2MTM2Njc0MzgsIm5iZiI6MTYxMzY2NzI1OH0.c5RgpI_7okku4-CvvAQGoRJv_sVOMx2CrAqP5muV8z8",
    },
  },
  caremergeDecodeTokenUrl: {
    doc: "Caremerge Url for decode token",
    format: String,
    default:
      "https://14w0k395zf.execute-api.us-east-1.amazonaws.com/dev/user/me",
  },
  app: {
    name: {
      doc: "Tha name of the integration app",
      format: String,
      default: "TELS Integration App",
    },
  },
  mailGunApiKey: {
    doc: "API Key for Mailgun",
    format: String,
    default: "key-45c0c428cbf3a36b7fc4b49be79ef9ab",
  },
});
