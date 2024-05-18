const express = require("express");
const app = express();
const cors = require('cors');
app.use(cors());
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const User = require('./user');
const Post = require('./post');
const connectionString = 'mongodb://127.0.0.1:27017/lab11';
var indx = '/index.html';
app.use(express.static(__dirname + "/"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/', (request, response) => {
    response.sendFile(process.cwd() + indx)
});
mongoose.connect(connectionString, {
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Failed to connect to MongoDB', err));
app.post('/api/regSubmit', async (request, response) => {
    console.log(request.body);
    const regName = request.body.name;
    const regPass = request.body.pass;
    var newUser = new User({ name: regName, pass: regPass });
    newUser.save()
        .then(() =>
            response.json({ "result": true })
        )
        .catch((err) => response.json({ "result": false }));
})
app.post('/api/authSubmit', async (request, response) => {
    console.log(request.body);
    const authName = request.body.name;
    const authPass = request.body.pass;
    try {
        const user = await User.findOne({ name: authName, pass: authPass });

        if (user) {
            console.log("User found:", user);
            response.json({ result: user })
        }
        else {
            console.log("User not found");
            response.json({ result: false });
        }
    }
    catch (err) {
        console.error("Error:", err);
        response.json({ result: false });
    }

})
app.listen(8000, () => {
    console.log("Listening");
});