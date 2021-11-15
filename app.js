const express = require("express");
const helmet = require("helmet");
const accessTokenModule = require("./modules/accessToken");
const md = require("./modules/middleware");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(helmet());

app.use(md.attachTokenToRequest);

const routes = require("./routes");
app.use("/api", routes);

app.set("view engine", "ejs");

app.use("/public", express.static(__dirname + "/public"));

module.exports = app;
