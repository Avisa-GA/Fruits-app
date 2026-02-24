const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

/**************************************************
 * GET - Sign Up Page
 **************************************************/
router.get("/sign-up", (req, res) => {
  res.render("auth/sign-up.ejs");
});


/**************************************************
 * POST - Sign Up
 **************************************************/
router.post("/sign-up", async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body;

    // 1️⃣ Check passwords match
    if (password !== confirmPassword) {
      return res.send("Passwords do not match.");
    }

    // 2️⃣ Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.send("Username already taken.");
    }

    // 3️⃣ Hash password
    const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS);

    // 4️⃣ Create user
    const newUser = await User.create({
      username,
      password: hashedPassword,
    });

    // 5️⃣ Auto login after signup
    req.session.user = {
      username: newUser.username,
      _id: newUser._id,
    };

    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.send("Something went wrong.");
  }
});


/**************************************************
 * GET - Sign In Page
 **************************************************/
router.get("/sign-in", (req, res) => {
  res.render("auth/sign-in.ejs");
});


/**************************************************
 * POST - Sign In
 **************************************************/
router.post("/sign-in", async (req, res) => {
  try {
    const userInDatabase = await User.findOne({
      username: req.body.username,
    });

    if (!userInDatabase) {
      return res.send("Login failed. Please try again.");
    }

    const validPassword = bcrypt.compareSync(
      req.body.password,
      userInDatabase.password
    );

    if (!validPassword) {
      return res.send("Login failed. Please try again.");
    }

    req.session.user = {
      username: userInDatabase.username,
      _id: userInDatabase._id,
    };

    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.send("Something went wrong.");
  }
});


/**************************************************
 * GET - Sign Out
 **************************************************/
router.get("/sign-out", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});


module.exports = router;