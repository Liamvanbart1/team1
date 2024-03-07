const express = require('express');
require('dotenv').config();
const app = express();
const port = 5000;

// mongoDB database
const { MongoClient, ServerApiVersion} = require("mongodb");

// Replace the uri string with your connection string.
const uri = process.env.DB_URI;

// dsdwdwd
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 
app.set('view engine', 'ejs');
app.use(express.static('static'));

app.get('/', (req, res) => {
    res.render('home');
  })

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });  
  