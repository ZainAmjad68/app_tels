const express = require("express");
const helmet = require("helmet");
const accessTokenModule = require("./modules/accessToken");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(helmet());

app.use(async function (req, res, next) {
  req.accessToken = await accessTokenModule.refreshTELSAccessToken();
  next();
});

const routes = require("./routes");
app.use("/api", routes);

app.set("view engine", "ejs");

app.use("/public", express.static(__dirname + "/public"));

module.exports = app;
