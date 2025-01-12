const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const Place = require('./models/Place');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'dsfdffgdsg4g45sdg1dsg2dsg';
const CookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
const multer = require('multer');
const fs = require('fs');
const { userInfo } = require('os');

const app = express();

//middleware
app.use(express.json());
app.use(CookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));
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

// ---------------------upload photos with link---------------------
app.post('/upload-by-link', async (req, res) => {
    const { link } = req.body;
    const newName = 'photo' + Date.now() + '.jpg'
    await imageDownloader.image({
        url: link,
        dest: __dirname + '/uploads/' + newName,
    })
    res.json(newName);
})
// -----------------------------------------------------------------

// ---------------------upload photos on computer---------------------
const photosMiddleware = multer({ dest: 'uploads' });
app.post('/upload', photosMiddleware.array('photos', 100), (req, res) => {
    const uploadedFiles = []
    for (let i = 0; i < req.files.length; i++) {
        const { path, originalname } = req.files[i];
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        const newPath = path + '.' + ext;
        fs.renameSync(path, newPath);
        uploadedFiles.push(newPath.replace('uploads/', ''));
    }
    res.json(uploadedFiles);
})
// -------------------------------------------------------------------

// ---------------------post a place---------------------
app.post('/places', (req, res) => {
    const { token } = req.cookies;
    const { title, address, addedPhotos, description, perks,
        extraInfo, checkIn, checkOut, maxGuests, price
    } = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;
        const placeDoc = await Place.create({
            owner: userData.id,
            title,
            address,
            photos: addedPhotos,
            description,
            perks,
            extraInfo,
            checkIn,
            checkOut,
            maxGuests,
            price,
        })
        res.json(placeDoc);
    });
})
// ------------------------------------------------------

// ---------------------get all places for specific user---------------------
app.get('/user-places', (req, res) => {
    const { token } = req.cookies;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        const { id } = userData;
        res.json(await Place.find({ owner: id }));
    })
})
// --------------------------------------------------------

// ---------------------get 1 place with id---------------------
app.get('/places/:id', async (req, res) => {
    const { id } = req.params;
    res.json(await Place.findById(id));
})
// -----------------------------------------------------------

// ---------------------update place with id---------------------
app.put('/places', async (req, res) => {
    const { token } = req.cookies;
    const { id, title, address, addedPhotos, description, perks,
        extraInfo, checkIn, checkOut, maxGuests, price,
    } = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;
        const placeDoc = await Place.findById(id);
        if (userData.id === placeDoc.owner.toString()) {
            placeDoc.set({
                title,
                address,
                photos: addedPhotos,
                description,
                perks,
                extraInfo,
                checkIn,
                checkOut,
                maxGuests,
                price,
            })
            await placeDoc.save();
            res.json('ok')
        }
    })
})
// -----------------------------------------------------------

// ---------------------get all places---------------------
app.get('/places', async (req, res) => {
    res.json(await Place.find());
})
// --------------------------------------------------------









app.listen(4000);

