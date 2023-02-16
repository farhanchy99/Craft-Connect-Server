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
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const users = client.db("Craft-Connect").collection("users");
    const usersPost = client.db("Craft-Connect").collection("usersPost");
    const reactions = client.db("Craft-Connect").collection("reactions");
    const comments = client.db("Craft-Connect").collection("comments");

    // home page get api
    app.get("/", (req, res) => {
      res.send("Craft connect server is running..");
    });

    // post added
    app.post("/usersPost", async (req, res) => {
      const usersData = req.body;
      const result = await usersPost.insertOne(usersData);
      res.send(result);
    });
    // all posts get
    app.get("/usersPost", async (req, res) => {
      const query = {};
      const result = await usersPost.find(query).toArray();
      res.send(result.reverse());
    });
    app.post("/reactions", async (req, res) => {
      // const id = req.params.id;
      const reactionInfo = req.body;
      // console.log(Reactioninfo)
      // const filter = {_id: ObjectId(id)};
      // const options = { upsert: true };
      // const updatedDoc = {
      //   $set: {
      //     emojiLink: Reactioninfo?.emojiLink,
      //   }
      // }

      const result = await reactions.insertOne(reactionInfo);
      res.send(result);
    });
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

    // for like post

    app.put("/users/:id", async (req, res) => {
      const likesInfo = req.body;
      // console.log(likesInfo);
      const ID = req.params.id;
      const filter = { _id: ObjectId(ID) };
      const updateDoc = {
        $set: {
          likes: likesInfo,
        },
      };
      const option = { upsert: true };
      const result = await usersPost.updateOne(filter, updateDoc, option);
      res.send(result);
    });

    // postReaction
    app.get("/postReactions/:id", async (req, res) => {
      const id = req.params.id;
      const result = await reactions.find({ uniqueId: id }).toArray();
      res.send(result);
    });
    // post details
    app.get("/postDetails/:id", async (req, res) => {
      const id = req.params.id;
      const result = await usersPost.findOne({ _id: ObjectId(id) });
      res.send(result);
    });
    //add comment
    app.post("/comment", async (req, res) => {
      const comment = req.body;
      const result = await comments.insertOne(comment);
      res.send(result);
    });

    //get post comment
    app.get("/comments/:id", async (req, res) => {
      const id = req.params.id;
      const result = await comments.find({ uniqueId: id }).toArray();
      res.send(result.reverse());
    });

    // edit comment
    app.patch("/editComment/:id", async (req, res) => {
      const id = req.params.id;
      const email = req.query?.email;
      const updatecomment = req.body?.updateComment;
      const filter = { _id: ObjectId(id), userEmail: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          commentText: updatecomment,
        },
      };
      const result = await comments.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    // Delete Comment
    app.delete("/deleteComment/:id", async (req, res) => {
      const id = req.params.id;
      const email = req.query.email;
      const filter = { _id: ObjectId(id), userEmail: email };
      const result = await comments.deleteOne(filter);
      res.send(result);
    });

    // HOME page get api
    app.get("/", (req, res) => {
      res.send("Craft connect server is running..");
    });
  } finally {
  }
}
run().catch((error) => console.log(error.message));

app.listen(port, (req, res) => {
  console.log("Craft connect server is running..");
});
