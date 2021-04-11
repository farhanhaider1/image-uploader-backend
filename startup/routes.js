const express = require("express");
var cors = require("cors");
const posts = require("../routes/posts");
const users = require("../routes/users");

module.exports = function (app) {
  app.use(cors());
  app.use(express.json({ limit: "100mb" }));
  app.use(express.urlencoded({ limit: "100mb" }));

  app.use("/users", users);
  app.use("/posts", posts);
};
