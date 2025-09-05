const mongoose = require('mongoose');
const Campground = require('../models/campground')
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .catch(error => console.error("Initial connection to yelp-camp failed: ", error));

const db = mongoose.connection; // short name
db.on("error", err => console.error(err)); // Handel errors after initial connection was established.
db.on("disconnected", msg => console.log("Mongoose lost connection to mongoDB: ", msg));
db.once("open", () => console.log("Database connected"));

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            author: '68b9e82d3e9008c1f8213efd',
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random1000].city} ${cities[random1000].state}`,
            image: `https://picsum.photos/400?random=${Math.random()}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatum.',
            price: Math.floor(Math.random() * 20) + 10,
        })
        await camp.save();
    }

    const c = new Campground({ title: 'purple field' });
    await c.save();
}

seedDB().then(() => mongoose.connection.close()); // Close MongoDB connection