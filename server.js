const express = require('express');
require('dotenv').config();
const app = express();
const xss = require("xss");

const session = require('express-session')
const { query } = require('express-validator');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const port = 8000;

// multer

const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })



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
const collectionArt = client.db(process.env.DB_COLLECTION2).collection(process.env.DB_NAME2);

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
  const name = xss(req.query.name);
  res.render('register', {name});
});

app.get('/login', (req, res) => {
  const name = xss(req.query.name);
  res.render('login', {name});
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
  
    
     const username= req.body.username
     const password= req.body.password
    
  
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
  
    await collection.insertOne({username, password: hashedPassword});
  
    res.redirect('/login');
  });
// redirection






app.get('/filter', async (req, res) => {
  try {
    const art = await collectionArt.findOne();
    res.render('filter', { art });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

let currentIndex = 0; // Houd de huidige index van het kunstwerk bij

app.post('/filter', async (req, res) => {
  try {
    const nextArtwork = await collectionArt.find().skip(currentIndex + 1).limit(1).toArray();
    if (currentIndex < 18) currentIndex += 1;
    else currentIndex = -1; // Verhoog de huidige index
    res.render('filter', { art: nextArtwork[0], nextIndex: currentIndex });
  } catch (error) {
    console.error('Er is een fout opgetreden bij het ophalen van het volgende kunstwerk:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden bij het ophalen van het volgende kunstwerk' });
  }
});
  
  

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});