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
const stripe = require("stripe")(process.env.STRIPE);

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
    const advertisePost = client
      .db("Craft-Connect")
      .collection("advertisePost");
    const reactions = client.db("Craft-Connect").collection("reactions");
    const comments = client.db("Craft-Connect").collection("comments");
    const allProducts = client.db("Craft-Connect").collection("allProducts");
    const bookMarkedPost = client
      .db("Craft-Connect")
      .collection("bookMarkedPost");
    const addToCart = client.db("Craft-Connect").collection("cartProducts");
    const reportedProduct = client
      .db("Craft-Connect")
      .collection("reportedProduct");
    const reportedPost = client.db("Craft-Connect").collection("reportedPost");
    const payments = client.db("Craft-Connect").collection("payments");
    const messenger = client.db("Messenger").collection("messenger");

    // home page get api
    app.get("/", (req, res) => {
      res.send("Craft connect server is running..");
    });

    //add to cart
    app.post("/addtocart", async (req, res) => {
      const product = req.body;
      const result = await addToCart.insertOne(product);
      res.send(result);
    });

    //Report Post
    app.post("/report-post", async (req, res) => {
      const post = req.body;
      const result = await reportedPost.insertOne(post);
      res.send(result);
    });

    //get reported post
    app.get("/reported-post", async (req, res) => {
      const query = {};
      const result = await reportedPost.find(query).toArray();
      res.send(result.reverse());
    });

    // delete reported product
    app.get("/delete-reported-post/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      console.log(query, id);
      const result = await reportedPost.deleteOne(query);
      res.send(result);
    });

    //Marketplace product details
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      console.log(query, id);
      const result = await allProducts.findOne(query);
      res.send(result);
    });

    // delete reported product
    app.get("/delete-reported-product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      console.log(query, id);
      const result = await reportedProduct.deleteOne(query);
      res.send(result);
    });

    //Post Report Product
    app.post("/reportproduct", async (req, res) => {
      const product = req.body;
      const result = await reportedProduct.insertOne(product);
      res.send(result);
    });

    //get reported product
    app.get("/reported-product", async (req, res) => {
      const query = {};
      const result = await reportedProduct.find(query).toArray();
      res.send(result.reverse());
    });

    //check admin
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await users.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });

    //update user profile(maruf)
    app.put("/update-users/:id", async (req, res) => {
      const id = req.params.id; 
      const data = req.body;
      console.log(id);
      const { displayName, email, photoURL } = data;
      const filter = { _id: ObjectId(id) };
      
      const updatedUser = {
        $set: {
          displayName,
          email,
          socialMedia: data.socialMedia,
          photoURL
        },
      };
      const result = await users.updateOne(filter, updatedUser);
      res.send(result);
    });
    
    //check is product already added to cart?
    app.get("/checkCartProduct", async (req, res) => {
      const availableProduct = req.query.id;
      console.log(availableProduct);
      const query = {
        productId: availableProduct,
      };
      const result = await addToCart.find(query).toArray();
      res.send(result);
    });

    //get cart product
    app.get("/cartproduct", async (req, res) => {
      const query = {};
      const result = await addToCart.find(query).toArray();
      res.send(result.reverse());
    });
    app.post("/create-payment-intent", async (req, res) => {
      const booking = req.body;
      const price = booking.price;
      const amount = price * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        currency: "usd",
        amount: amount,
        payment_method_types: ["card"],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });
    app.post("/payments", async (req, res) => {
      const payment = req.body;
      const result = await payments.insertOne(payment);
      const id = payment.productId;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          paid: true,
          transactionId: payment.transactionId,
        },
      };
      const updateResult = await addToCart.updateOne(filter, updateDoc);
      res.send(result);
    });
    //get cart product
    app.get("/cartproduct", async (req, res) => {
      const query = {};
      const result = await addToCart.find(query).toArray();
      res.send(result.reverse());
    });
    app.get("/cartproduct/:email", async (req, res) => {
      const email = req.params.email;
      const result = await addToCart.find({ buyerEmail: email }).toArray();
      res.send(result.reverse());
    });
    app.get("/cartproducts/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await addToCart.deleteOne(query);
      res.send(result);
    });
    //get all products
    app.get("/products", async (req, res) => {
      const query = {};
      const result = await allProducts.find(query).toArray();
      res.send(result);
    });

    // get all users
    app.get("/allusers", async (req, res) => {
      const query = {};
      const result = await users.find(query).toArray();
      res.send(result.reverse());
    });

    //get my post
    app.get("/myposts", async (req, res) => {
      const email = req.query.email;
      // console.log(email);
      const query = {
        userEmail: email,
      };
      const result = await usersPost.find(query).toArray();
      res.send(result);
    });
    //get users posts in users profile
    app.get("/users-post", async (req, res) => {
      const email = req.query.email;
      console.log(email);
      const query = {
        userEmail: email,
      };
      const result = await usersPost.find(query).toArray();
      res.send(result);
    });

    //get user by email // my profile
    app.get("/users", async (req, res) => {
      const email = req.query.email;
      const query = {
        email: email,
      };
      const result = await users.find(query).toArray();
      res.send(result);
    });
    //get user by id
    app.get("/users/:email", async (req, res) => {
      const UserEmail = req.params.email;
      //  console.log(UserEmail);
      const query = {
        email: UserEmail,
      };
      const userByEmail = await users.findOne(query);
      //console.log(userByEmail);
      res.send(userByEmail);
    });

    //update user profile picture
    app.put("/users/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const coverImage = req.body;
      //console.log(coverImage);
      const option = { upsert: true };
      const updatedUser = {
        $set: {
          coverPhoto: coverImage.coverImage,
        },
      };
      const result = await users.updateOne(filter, updatedUser, option);
      res.send(result);
    });

    app.put("/profileImg/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const profileImgs = req.body;
      const { images } = profileImgs;
      console.log(images);
      // console.log(profileImg.profileImg);
      const option = { upsert: true };
      const updatedUser = {
        $set: {
          photoURL: images,
        },
      };
      const result = await users.updateOne(filter, updatedUser, option);
      res.send(result);
    });

    //get user by id
    app.get("/user/:email", async (req, res) => {
      const UserEmail = req.params.email;
      //  console.log(UserEmail);
      const query = {
        email: UserEmail,
      };
      const userByEmail = await users.findOne(query);
      //console.log(userByEmail);
      res.send(userByEmail);
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
      //console.log(id);
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
    // ++++++++++++++++++++++ Advertising Post Method ++++++++++++++ to frontend
    app.post("/advertising-post/", async (req, res) => {
      const advertisingData = req.body;
      const result = await advertisePost.insertOne(advertisingData);
      res.send(result);
    });
    // getting advertisePost
    app.get("/advertising-post/", async (req, res) => {
      const query = {};
      const result = await advertisePost.find(query).toArray();
      res.send(result.reverse());
    });
    // getting and single add
    app.get("/advertising-post/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      console.log(query, id);
      const result = await advertisePost.findOne(query);
      res.send(result);
    });
    // getting product Data
    app.post("/allProduct/", async (req, res) => {
      const data = req.body;
      console.log(data);
      const result = await allProducts.insertOne(data);
      res.send(result);
    });
    app.get("/allProduct", async (req, res) => {
      const query = {};
      const result = await allProducts.find(query).toArray();
      res.send(result.reverse());
    });

    // Mohammad Ali Jinnah
    //Add bookmarked post at DB
    app.post("/user/bookmark", async (req, res) => {
      const bookMarkPost = req.body;
      const result = await bookMarkedPost.insertOne(bookMarkPost);
      res.send(result);
    });

    //Get data from DB using email
    app.get("/user/bookmarkPost/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { bookmarkedUserEmail: email };
      const result = await bookMarkedPost.find(filter).toArray();
      res.send(result);
    });

    //Delete a document form Bookmarked
    app.delete("/user/bookmarkedPost/:id", async (req, res) => {
      const post_id = req.params.id;
      const filter = { _id: ObjectId(post_id) };
      const result = await bookMarkedPost.deleteOne(filter);
      res.send(result);
    });

    app.get("/allProducts/", async (req, res) => {
      const email = req.query.email;
      const filter = { email: email };
      const result = await allProducts.find(filter).toArray();
      res.send(result.reverse());
    });
    app.get("/allProducts/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const result = await allProducts.deleteOne({ _id: ObjectId(id) });
      res.send(result);
    });

    app.get("/message/:id", async (req, res) => {
      const recieverId = req.params.id;
      const filter = { recieverId: recieverId };
      const result = await messenger.find(filter).toArray();
      res.send(result);
    });

    app.get("/allmesseges", async (req, res) => {
      const query = {};
      const result = await messenger.find(query).toArray();
      res.send(result.reverse());
    });

    app.post("/send-messenger", async (req, res) => {
      const sendmssg = req.body;
      const result = await messenger.insertOne(sendmssg);
      res.send(result);
    });



    // HOME page get api
    app.get("/", (req, res) => {
      res.send("Craft connect server is running..");
    });
  }
  finally {
 }
}
run().catch((error) => console.log(error.message));

app.listen(port, (req, res) => {
  console.log("Craft connect server is running..");

}); 
