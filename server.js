/**************************************************
 * 1️⃣ IMPORTS & CONFIG
 **************************************************/
const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;

// Controllers & Middleware
const authController = require("./controllers/auth.js");
const isSignedIn = require("./middleware/is-signed-in.js");

// Models
const Fruit = require("./models/fruit.js");

dotenv.config();

const app = express();


/**************************************************
 * 2️⃣ DATABASE CONNECTION
 **************************************************/
mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on("connected", () => {
  console.log(`✅ Connected to MongoDB: ${mongoose.connection.name}`);
});


/**************************************************
 * 3️⃣ GLOBAL MIDDLEWARE
 **************************************************/
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));


/**************************************************
 * 4️⃣ SESSION CONFIGURATION
 **************************************************/
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongoUrl: process.env.MONGODB_URI,
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);


/**************************************************
 * 5️⃣ ROUTE MIDDLEWARE
 **************************************************/
app.use("/auth", authController);


/**************************************************
 * 6️⃣ ROUTES
 **************************************************/

// Home
app.get("/", (req, res) => {
  res.render("index.ejs", {
    user: req.session.user,
  });
});

// Protected Route
app.get("/vip-lounge", isSignedIn, (req, res) => {
  res.send(`Welcome to the party ${req.session.user.username}.`);
});

// Index
app.get("/fruits",isSignedIn, async (req, res) => {
  const fruits = await Fruit.find();
  res.render("fruits/index.ejs", { fruits });
});

// New
app.get("/fruits/new",isSignedIn, (req, res) => {
  res.render("fruits/new.ejs");
});

// Show
app.get("/fruits/:fruitId",isSignedIn, async (req, res) => {
  const fruit = await Fruit.findById(req.params.fruitId);
  res.render("fruits/show.ejs", { fruit });
});

// Create
app.post("/fruits",isSignedIn, async (req, res) => {
  req.body.isReadyToEat = req.body.isReadyToEat === "on";
  await Fruit.create(req.body);
  res.redirect("/fruits");
});

// Edit
app.get("/fruits/:fruitId/edit",isSignedIn, async (req, res) => {
  const fruit = await Fruit.findById(req.params.fruitId);
  res.render("fruits/edit.ejs", { fruit });
});

// Update
app.put("/fruits/:fruitId",isSignedIn, async (req, res) => {
  req.body.isReadyToEat = req.body.isReadyToEat === "on";
  await Fruit.findByIdAndUpdate(req.params.fruitId, req.body);
  res.redirect(`/fruits/${req.params.fruitId}`);
});

// Delete
app.delete("/fruits/:fruitId",isSignedIn, async (req, res) => {
  await Fruit.findByIdAndDelete(req.params.fruitId);
  res.redirect("/fruits");
});


/**************************************************
 * 7️⃣ SERVER
 **************************************************/
app.listen(3000, () => {
  console.log("🚀 Listening on port 3000");
});