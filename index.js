const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'dsfdffgdsg4g45sdg1dsg2dsg';
const CookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');

const app = express();

app.use(express.json());
app.use(CookieParser());


app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173',
}));

mongoose.connect(process.env.MONGO_URL);

// ---------------------Register---------------------
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userDoc = await User.create({
            name,
            email,
            password: bcrypt.hashSync(password, bcryptSalt),
        })
        res.json(userDoc);
    }
    catch (e) {
        res.status(422).json(e);
    }

})
// --------------------------------------------------


// ---------------------Login---------------------
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const userDoc = await User.findOne({ email });
    if (userDoc) {
        const passOk = bcrypt.compareSync(password, userDoc.password);
        if (passOk) {
            jwt.sign({ email: userDoc.email, id: userDoc._id }, jwtSecret, {}, (err, token) => {
                if (err) throw err;
                res.cookie('token', token).json(userDoc);
            });
        }
        else {
            res.json(`Password doesn't match`);
        }
    }
    else {
        res.json('not found');
    }
})
//------------------------------------------------

// ---------------------logout---------------------
app.post('/logout', (req, res) => {
    res.cookie('token', '').json(true);
})
// ------------------------------------------------


// ---------------------profile---------------------
app.get('/profile', (req, res) => {
    const { token } = req.cookies;
    if (token) {
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) throw err;
            const { name, email, _id } = await User.findById(userData.id);
            res.json({ name, email, _id });
        });
    }
    else {
        res.json(null);
    }
})
// -------------------------------------------------

// ---------------------upload photos---------------------
app.post('/upload-by-link', async (req, res) => {
    const { link } = req.body;
    const newName = 'photo' + Date.now() + '.jpg'
    await imageDownloader.image({
        url: link,
        dest: __dirname + '/uploads/' + newName,
    })
    res.json(newName);
})
// -------------------------------------------------------



app.listen(4000);

