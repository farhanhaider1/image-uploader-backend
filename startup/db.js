const mongoose = require("mongoose");

module.exports = function () {
  const url = `mongodb+srv://admin:qmobilea5@bytes-imgs.36cd8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

  const connectionParams = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  };
  mongoose
    .connect(url, connectionParams)
    .then(() => {
      console.log("Connected to database ");
    })
    .catch((err) => {
      console.error(`Error connecting to the database. \n${err}`);
    });
};
