const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

//middleware
app.use(cors());
app.use(express.json());

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ltux5vg.mongodb.net/?retryWrites=true&w=majority`;
// const client = new MongoClient(uri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   serverApi: ServerApiVersion.v1,
// });

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ltux5vg.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    const users = client.db("Craft-Connect").collection("users");
    const usersPost = client.db("Craft-Connect").collection("usersPost");

    // home page get api
    app.get("/", (req, res) => {
      res.send("Craft connect server is running..");
    });

    // post added
    app.post("/usersPost", async (req, res) => {
      const usersData = req.body;
      const result = await usersPost.insertOne(usersData);
      console.log(usersData)
      res.send(result);
    });
    // all posts get
    app.get("/usersPost", async (req, res) => {
      const query = {};
      const result = await usersPost.find(query).toArray();
      res.send(result.reverse());
    });
    app.patch('/usersPost:id', async(req, res) => {
      const id = req.params.id;
      const emojiLink = req.body.imageLink;
      const filter = {_id: ObjectId(id)};
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          emojiLink: emojiLink
        }
      }

      const result = await usersPost.updateOne(filter, updatedDoc, options);
      res.send(result);


    })
    // post delete
    app.delete("/usersPost/:id", async (req, res) => {
      const id = req.params.id;
      const result = await usersPost.deleteOne({ _id: ObjectId(id) });
      res.send(result);
    });

    // user created post
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await users.insertOne(user);
      res.send(result);
    });
    // all users get
    app.get("/users", async (req, res) => {
      const result = await users.find({}).toArray();
      res.send(result);
    });
  } 
  finally {}
}
run().catch((error) => console.log(error.message));

app.listen(port, (req, res) => {
  console.log("Craft connect server is running..");
});
