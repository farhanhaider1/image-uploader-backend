require("dotenv/config");
const express = require("express");
const app = express();

require("./startup/routes")(app);
require("./startup/db")();

const port = process.env.PORT || 9000;
app.listen(port, () => console.info(`Listening on port ${port}...`));
