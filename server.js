const express = require('express');
require('dotenv').config();
const app = express();
const port = 8000;

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

const collection = client.db(process.env.DB_COLLECTION).collection(process.env.DB_NAME);
const collectionArt = client.db(process.env.DB_COLLECTION2).collection(process.env.DB_NAME2);

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 
app.set('view engine', 'ejs');
app.use(express.static('static'));

app.get('/', (req, res) => {
    res.render('home');
  })

  app.get('/index', async (req, res) => {
    const users = await collection.find().toArray()
    res.render('index', {users});
  })

  app.post('/', async (req, res) => {
    console.log(req.body);
  
    const user = {
      username: req.body.username,
      password: req.body.password
    }
  
    await collection.insertOne(user);
  
  
    res.redirect('/index');
  });
  
  app.post('/index', async (req, res) => {
    console.log(req.body);
  
    const user = {
      username: req.body.username,
      password: req.body.password
    }
  
    await collection.insertOne(user);
  
    
    
  
    res.redirect('/index');
  });
  

  app.get('/filter', async (req, res) => {
    const art = await collectionArt.find().toArray()
    res.render('filter', {art});
  })
  

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });  
  