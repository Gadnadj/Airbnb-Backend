const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const bcryptSalt = bcrypt.genSaltSync(10);

const app = express();

app.use(express.json());


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
    console.log(req.body + 'fsfdsfdsf');
    const { email, password } = req.body;
    console.log(email + 'im dont have any email');
    const userDoc = await User.findOne({ email });
    if (userDoc) {
        res.json('found')
    }
    else {
        res.json('not found');
    }
})

//------------------------------------------------

app.listen(4000);

