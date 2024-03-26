const express = require('express');
require('dotenv').config();
const app = express();
const xss = require("xss");

const session = require('express-session');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const port = 8000;

// multer
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.DB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

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

// Validation middleware for registration
const validateRegistration = [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Invalid email'),
  body('phonenumber').notEmpty().withMessage('Phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')

];

// Validation middleware for login
const validateLogin = [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required') 
];

// Routes

app.get('/', async (req, res) => {
  const users = await collection.find().toArray();
  res.render('index', { users });
});

app.get('/register', async (req, res) => {
  const name = xss(req.query.name);
  const artworks = await collectionArt.find().toArray();
  console.log(artworks);
  res.render('register', { artworks });
});

app.get('/login', (req, res) => {
  const name = xss(req.query.name);
  res.render('login', { name });
});

app.get('/likes', (req, res) => {
  res.render('likes');
});

app.get('/musea', (req, res) => {
  res.render('musea');
});

app.get('/account', (req, res) => {
  res.render('account');
});

app.post('/register', validateRegistration, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const { username, email, phonenumber } = req.body;
      return res.render('register', { errors: errors.array(), username, email, phonenumber });
    }

    const { username, password, email, phonenumber } = req.body;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    await collection.insertOne({ username, email, phonenumber, password: hashedPassword });

    res.redirect('/login');
});


app.post('/login', validateLogin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const { username, password } = req.body;
    return res.render('login', { errors: errors.array(), username, password})
  }

  // If there are no validation errors, proceed with login logic
  const { username, password } = req.body;
  try {
    const existingUser = await collection.findOne({ username });

    if (existingUser) {
      const hashedPassword = existingUser.password;
      const isPasswordCorrect = await bcrypt.compareSync(password, hashedPassword);

      if (isPasswordCorrect) {
        res.redirect('/'); // Redirect to a dashboard or home page after successful login
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

app.get('/home', async (req, res) => {
  try {
    // Haal alle kunstwerken op uit de database
    const artworks = await collectionArt.find().toArray();

    // Maak een object om kunstwerken te groeperen op museum
    const artworksByMuseum = {};
    artworks.forEach(artwork => {
      if (!artworksByMuseum[artwork.museum]) {
        artworksByMuseum[artwork.museum] = [];
      }
      artworksByMuseum[artwork.museum].push(artwork);
    });

    // Kies willekeurig een museum
    const museums = Object.keys(artworksByMuseum);
    const randomMuseumIndex = Math.floor(Math.random() * museums.length);
    const randomMuseum = museums[randomMuseumIndex];

    // Kies willekeurig een kunstwerk uit het gekozen museum
    const randomArtwork = artworksByMuseum[randomMuseum][Math.floor(Math.random() * artworksByMuseum[randomMuseum].length)];

    res.render('home', { artwork: randomArtwork });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});






// FILTEREN

// Buiten de route handler, declareer een array om bij te houden welke kunstwerken al zijn gebruikt
let usedArtworks = [];
let clickCount = 0;

app.post('/home', async (req, res) => {
  try {
    if (clickCount >= 20) {
      // Als er 20 keer is geklikt, stuur de gebruiker door naar de '/index' pagina
      res.redirect('/index');
      return;
    }

    // Count the total number of documents in the collection
    const totalCount = await collectionArt.countDocuments();

    // If all artworks have been used, reset the array
    if (usedArtworks.length === totalCount) {
      usedArtworks = [];
    }

    // Generate a random index that hasn't been used yet
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * totalCount);
    } while (usedArtworks.includes(randomIndex));

    // Add the random index to the used artworks array
    usedArtworks.push(randomIndex);

    // Find a random artwork
    const randomArtwork = await collectionArt.aggregate([
      { $skip: randomIndex }, // Skip to the random index
      { $limit: 1 } // Limit the result to 1 document
    ]).toArray();

    // Increment the click count
    clickCount++;

    // Render the view with the random artwork
    res.render('home', { art: randomArtwork[0] });
  } catch (error) {
    console.error('Er is een fout opgetreden bij het ophalen van het volgende kunstwerk:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden bij het ophalen van het volgende kunstwerk' });
  }
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

