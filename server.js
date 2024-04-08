const express = require('express');
require('dotenv').config();
const app = express();
const xss = require("xss");
const compression = require('compression');

const session = require('express-session');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const saltRounds = 10;
app.use(compression());

const port = 8002;




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


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
  body('password').notEmpty().withMessage('Password is required'),
];

const requireLogin = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    next();
};

// Session middleware //

app.use(session({
    secret: 'de_secret_key_voor_inloggen', // Change this to a more secure secret in production
    resave: false,
    saveUninitialized: true,
    rolling: true,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours,
  }
}));


// Routes

app.get('/', async (req, res) => {
  const users = await collection.find().toArray();
  res.render('index', { users });
});



app.get('/register', async (req, res) => {
  const name = xss(req.query.name);

  try {
    const museumData = await collectionArt.find().toArray();
    const allIds = museumData.flatMap(artwork => artwork.arts.map(art => art._id));
    res.render('register', { name, allIds }); // Pass allIds to the template
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }

});




app.get('/login', async (req, res) => {
  const name = xss(req.query.name);
  res.render('login', { name });
});

app.get('/likes', requireLogin, async (req, res) => {
  try {
    let data = await collectionArt.find().toArray();

    // Filter de data op basis van de zoekterm
    const searchTerm = req.query.searchTerm ? req.query.searchTerm.toLowerCase() : '';
    if (searchTerm) {
      data = data.filter(museum => {
        museum.arts = museum.arts.filter(artwork => {
          return (
            artwork.kunstwerk.toLowerCase().includes(searchTerm) ||
            artwork.artiest.toLowerCase().includes(searchTerm) ||
            artwork.jaartal.toLowerCase().includes(searchTerm) ||
            museum.museum.toLowerCase().includes(searchTerm) ||
            museum.locatie.toLowerCase().includes(searchTerm)
          );
        });
        return museum.arts.length > 0;
      });
    }

    // Verzamel alle kunstwerken in één array met hun respectievelijke museum en locatie
    let allArtworks = [];
    data.forEach(museum => {
      museum.arts.forEach(artwork => {
        allArtworks.push({ museum: museum.museum, locatie: museum.locatie, ...artwork });
      });
    });

    // Sorteer de data op basis van de sorteeroptie
    const sortBy = req.query.sortBy || 'rating';
    switch (sortBy) {
      case 'name':
        allArtworks.sort((a, b) => (a.kunstwerk > b.kunstwerk) ? 1 : -1);
        break;
      case 'artist':
        allArtworks.sort((a, b) => (a.artiest > b.artiest) ? 1 : -1);
        break;
      case 'museum':
        allArtworks.sort((a, b) => (a.museum > b.museum) ? 1 : -1);
        break;
      case 'year':
        allArtworks.sort((a, b) => (a.jaartal > b.jaartal) ? 1 : -1);
        break;
      default: // Rating
        allArtworks.sort((a, b) => b.beoordeling - a.beoordeling);
    }

    res.render('likes', { data: allArtworks });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});





app.get('/musea', requireLogin, async (req, res) => {
  try {
    let query = {}; // Standaardquery om alle musea op te halen

    // Als er een zoekterm is opgegeven, filteren we op museumnaam en locatie
    if (req.query.searchTerm) {
      query = {
        $or: [
          { museum: { $regex: req.query.searchTerm, $options: 'i' } }, // Zoek in museumnaam
          { locatie: { $regex: req.query.searchTerm, $options: 'i' } } // Zoek in locatie
        ]
      };
    }

    

    // Haal de kunstwerken op uit de database met optionele zoekterm
    const data = await collectionArt.find(query).toArray();

    // Bereken de totale beoordelingen per museum en het aantal beoordelingen per museum
    const museumsWithRatings = await collectionArt.aggregate([
      {
        $unwind: "$arts" // Maak individuele documenten voor elk kunstwerk in de "arts" array
      },
      {
        $group: {
          _id: "$museum",
          totalRating: { $sum: "$arts.beoordeling" }, // Optellen van alle beoordelingen per museum
          ratingsCount: { $sum: 1 } // Tellen van het aantal beoordelingen per museum
        }
      }
    ]).toArray();

    // Voeg de gemiddelde beoordeling toe aan de museumgegevens
    data.forEach(item => {
      const museumRating = museumsWithRatings.find(museum => museum._id === item.museum);
      if (museumRating && museumRating.ratingsCount > 0) {
        item.averageRating = museumRating.totalRating / museumRating.ratingsCount;
      } else {
        item.averageRating = 0; // Stel gemiddelde in op 0 als er geen beoordelingen zijn
      }
    });

// Sorteer de musea op basis van de sorteeroptie
const sortBy = req.query.sortBy || 'rating';
switch (sortBy) {
  case 'name':
    // Sorteer op naam
    data.sort((a, b) => (a.museum > b.museum) ? 1 : -1);
    break;
  case 'location':
    // Sorteer op locatie
    data.sort((a, b) => (a.locatie > b.locatie) ? 1 : -1);
    break;
    case 'distance':
      data.sort((a, b) => a.afstand_km - b.afstand_km); // Sorteer op afstand
      break;
  default:
    // Standaard sorteer op rating
    data.sort((a, b) => b.averageRating - a.averageRating);
}


    // Render de musea.ejs-sjabloon met de geaggregeerde en gesorteerde gegevens
    res.render('musea', { data });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
















app.get('/account', requireLogin, async(req, res) => {
  const name = xss(req.query.name);
  const objectId = new ObjectId(req.session.username);

  const users = await collection.findOne({ "_id": objectId });

  res.render('account', {name, users });
});

app.get('/logout', requireLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.send('Error logging out');
        }
        res.redirect('/login');
    });
});


app.post('/register', validateRegistration, async (req, res) => {
  // Validate form data
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      // If validation fails, render the registration form with errors
      return res.render('register', { errors: errors.array() });
  }

  // Extract form data
  const { username, password, email, phonenumber, images } = req.body;
// 'images' will be an array containing the selected image IDs


  try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Save user data to the database
      await collection.insertOne({ username, password: hashedPassword, email, phonenumber, images });

      // Redirect to login page after successful registration
      res.redirect('/login');
  } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).send('Internal Server Error');
  }
});




app.post('/login', validateLogin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      const { username, password } = req.body;
      return res.render('login', { errors: errors.array(), username, password });
  }

  // If there are no validation errors, proceed with login logic
  const { username, password } = req.body;
  try {
      const existingUser = await collection.findOne({ username });


      if (!existingUser) {
          return res.render('login', { errors: [{ msg: 'User not found' }] });
      }

      const hashedPassword = existingUser.password;
      const isPasswordCorrect = await bcrypt.compareSync(password, hashedPassword);

      if (isPasswordCorrect) {
          // Store the username in the session
          req.session.user = username;
          req.session.username = existingUser._id;
          res.redirect('/home'); // Redirect to a dashboard or home page after successful login
      } else {
          res.render('login', { errors: [{ msg: 'Incorrect password' }], username });
      }
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }

});





app.post('/account', async (req, res) => {
    const objectId = new ObjectId(req.session.username);
    const gebruiker = await collection.findOne({ "_id": objectId });
    console.log('Object ID:', objectId);
    console.log('User Data:', gebruiker);



    try {
        // Retrieve the user's current password hash from the database
      // const users = await collection.findOne({ "_id": objectId });
      const currentPasswordHash = gebruiker.password;

        // Compare the inputted old password with the stored hash
        const isPasswordMatch = await bcrypt.compare(req.body.oldPassword, currentPasswordHash);
        const newData = { username: req.body.username, email: req.body.email, phonenumber: req.body.phonenumber };

        if (!isPasswordMatch) {
          return res.status(400).send('Incorrect old password');
        }

        // Hash the new password
        const newPasswordHash = await bcrypt.hash(req.body.newPassword, saltRounds);

        // Update the user's password in the database with the new hashed password
        await collection.updateOne({ "_id": new ObjectId(objectId) }, { $set: { password: newPasswordHash } });
        await collection.updateOne({ "_id": new ObjectId(objectId) }, { $set: newData });
        // Redirect to the account page or send a success response
        res.redirect('/account');
        // or res.send('Password updated successfully');
    } catch (error) {
        // Handle errors
        console.error('Error updating password:', error);
        res.status(500).send('Error updating password');
    }
});




app.get('/home', requireLogin, async (req, res) => {
  try {
    // Haal alle kunstwerken op uit de database
    await new Promise(resolve => setTimeout(resolve, 360));
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
app.post('/home', async (req, res) => {
  try {
    const artworkId = req.body.artworkId;
    const rating = parseInt(req.body.rating);

    // Update de beoordeling voor het specifieke kunstwerk in de database
    await collectionArt.updateOne({ "arts.kunstwerk": artworkId }, { $set: { "arts.$.beoordeling": rating } });

    res.redirect('/home'); // Stuur de gebruiker terug naar de homepage
  } catch (error) {
    console.error('Er is een fout opgetreden bij het verwerken van de beoordeling:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden bij het verwerken van de beoordeling' });
  }
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
