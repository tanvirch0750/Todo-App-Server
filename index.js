const express = require("express");
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("todo app server is running");
});

// const run = async () => {
//    try {

//    } finally {
//    }
//  };
//  run().catch(console.dir);

app.listen(port, () => {
  console.log("Listening to car repair port", port);
});
