// if (process.env.NODE_ENV !== "production") {
//     require('dotenv').config(); // takes the key-value pairs and add into process.env
//     console.log("Some process.env properties:");
//     const cloudinaryKeys = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_SECRET"];
//     cloudinaryKeys.forEach((v) => {console.log(`- ${v}: ${process.env[`${v}`]}`)});
//     console.log();
// }
require('dotenv').config(); // takes the key-value pairs and add into process.env


const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const campgroundsRouter = require('./routes/campgrounds');
const reviewsRouter = require('./routes/reviews');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const userRouter = require('./routes/users');
const mongoSanitize = require('express-mongo-sanitize');
const MongoDBStore = require('connect-mongo')(session);


// Constants
const dbUrl = process.env.DB_URL;
const sessionSecret = process.env.SESSION_SECRET;

// mongodb+srv://shxu:<db_password>@cluster0.sopph6c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
// mongodb://127.0.0.1:27017/yelp-camp'
mongoose.connect(dbUrl)
    .catch(error => console.error("Initial connection to yelp-camp failed: ", error));

const db = mongoose.connection; // short name
db.on("error", err => console.error(err)); // Handel errors after initial connection was established.
db.on("disconnected", msg => console.log("Mongoose lost connection to mongoDB: ", msg));
db.once("open", () => console.log("Database connected\n\n===================="));

// Express and Middleware
const app = express();

app.engine('ejs', ejsMate); // Use ejsMate for layout support
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Placing this middleware at the beginning of the chain can make sure we see every request,
// including requests for static files.
app.use((req, _res, next) => {
    console.log("Requested Raw URL:", req.method, req.originalUrl);
    console.log("req.params:", req.params);
    console.log("req.query:", req.query, "\n ");
    next();
})

// By default, $ and . characters are removed completely from user-supplied input in the following places:
// - req.body
// - req.params
// - req.headers
// - req.query

// To remove data using these defaults:
app.use(mongoSanitize());

const store = new MongoDBStore({
    url: dbUrl,
    secret: sessionSecret,
    touchAfter: 24*60*60,
})

store.on("error", function(e) {
    console.log("Session store error:", e.message);
})

app.use((req, _res, next) => {
    console.log("Requested Sanitized URL:", req.method, req.originalUrl);
    console.log("req.params:", req.params);
    console.log("req.query:", req.query, "\n ");
    next();
})

// The static file serving middleware should be placed here in order to eliminate repeated requests.
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

const sessionConfig = {
    // name: "sessionIdName",
    store,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // One week from now
        httpOnly: true, // Cookie cannot be accessed through client-side script
        // secure: true // can only be configured via HTTPS
    }
}

app.use(session(sessionConfig));
app.use((req, res, next) => {
    // console.log("Querying req 1:");
    // console.log("req.params:", req.params, "req.query:", req.query, "\n");
    next();
})
app.use(express.urlencoded({ extended: true }));
app.use(flash()); // flash middleware must come after session middleware

app.use(passport.initialize());
app.use(passport.session()); // Must come after session middleware
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(methodOverride('_method'))
app.use((req, res, next) => {
    // console.log("req.session: ", req.session);
    // console.log("WTF", req.body, req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});
app.use((req, res, next) => {
    // console.log("Querying req 2:");
    // console.log("req.params:", req.params, "req.query:", req.query, "\n");
    next();
})

// Here is the original static file serving point

app.use((req, res, next) => {
    // console.log("Querying req 3:");
    // console.log("req.params:", req.params, "req.query:", req.query, "\n");
    next();
})

app.use('/campgrounds', campgroundsRouter);
app.use('/campgrounds/:id/reviews', reviewsRouter);
app.use('/', userRouter);



app.get('/', (req, res) => {
    res.render('home');
})

app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError("Page not found", 404));
})

app.use((err, req, res, _next) => {
    console.log("=== In generic error handler: ===")
    console.log("Error:", err);
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh no, something went wrong!';
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
    console.log("Serving on port 3000.");
})