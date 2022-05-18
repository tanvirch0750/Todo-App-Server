const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const verifyJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(authHeader);
  if (!authHeader) {
    res.status(401).send({ message: "Unauthorized access" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }

    req.decoded = decoded;
    next();
  });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.r3o7j.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    await client.connect();
    console.log("todo app mongo db server is running");

    const tasksCollection = client.db("todo-app").collection("tasks");
    const userCollection = client.db("todo-app").collection("users");

    // Main route
    app.get("/", (req, res) => {
      res.send("todo app server is running");
    });

    // Users
    //post - will use when login and signup
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;

      const filter = { email };
      const options = { upsert: true };

      const updateDoc = {
        $set: user,
      };

      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN, {
        expiresIn: "1d",
      });
      res.send({ result, token });
    });

    // post task
    app.post("/tasks", async (req, res) => {
      const tasks = req.body;
      const result = await tasksCollection.insertOne(tasks);
      res.send(result);
    });

    // get task
    app.get("/tasks", verifyJwt, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      console.log(decodedEmail, email);
      if (email === decodedEmail) {
        const query = { email: email };
        const cursor = tasksCollection.find(query);
        const tasks = await cursor.toArray();
        return res.send(tasks);
      } else {
        return res.status(403).send({ message: "forbidden access" });
      }
    });

    // completed task
    app.put("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: { status: "completed" },
      };
      const result = await tasksCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // delete
    app.delete("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await tasksCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
};
run().catch(console.dir);

app.listen(port, () => {
  console.log("Listening to car repair port", port);
});
