const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground')

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .catch(error => console.error("Initial connection to yelp-camp failed."));

const db = mongoose.connection; // short name
db.on("error", err => console.error(err)); // Handel errors after initial connection was established.
db.on("disconnected", msg => console.log("Mongoose lost connection to mongoDB: ", msg));
db.once("open", () => console.log("Database connected"));


// Express and Middleware
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
    res.render('home');
})

app.get('/makecampground', async (req, res) => {
    const camp = new Campground({ title: 'My Backyard', description: 'cheap camping' });
    await camp.save();
    res.send(camp);
})

app.listen(3000, () => {
    console.log("Serving on port 3000.");
})