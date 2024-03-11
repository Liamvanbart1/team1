const express = require('express');
require('dotenv').config();
const app = express();
const xss = require("xss");
const port = 8000;



const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.DB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
// kdbascjbwixnakxnlqx

async function run() {
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log('Pinged your deployment. You successfully connected to MongoDB!');
  } finally {
    // Do not close the connection here, let it stay open for the server to use
  }
}
run().catch(console.dir);

const collection = client.db(process.env.DB_COLLECTION).collection(process.env.DB_NAME);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.use(express.static('static'));

// Routes

app.get('/', (req, res) => {
  const name = xss(req.query.name);
  res.render('home', {name});
});

app.get('/index', async (req, res) => {
  const users = await collection.find().toArray();
  res.render('index', { users });
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/login', (req, res) => {
  res.render('login');
});


app.post('/login', async (req, res) => {
  console.log(req.body);
  const username = req.body.username
  const password = req.body.password
  try {
    // Check if the user exists in the database
    const existingUser = await collection.findOne({ username});

    console.log(existingUser)

    if (existingUser) {
      // Check if the password is correct
      if (existingUser.password === password) {
        // Successful login
        let bericht = "je bent ingelogd"
        res.render('home', {bericht}); // Redirect to a dashboard or home page after successful login
      } else {
        res.send('Incorrect password');
      }
    } else {
      res.send('User not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
  
});


app.post('/register', async (req, res) => {
  console.log(req.body);

  const user = {
    username: req.body.username,
    password: req.body.password, 
  };

  await collection.insertOne(user);

  res.render('/login');
});





app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});