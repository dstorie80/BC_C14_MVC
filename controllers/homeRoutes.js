//---------------------------------------------------------------------------//
//                       setup homeRoute varriables                          //
//---------------------------------------------------------------------------//
// setup homeRoute varriables
const express = require("express");
const router = express.Router();
// const router = require("express").Router();
const { Post, User } = require("../models");
const withAuth = require("../utils/auth");

//---------------------------------------------------------------------------//
//                           render the homepage                             //
//---------------------------------------------------------------------------//
router.get("/", async (req, res) => {
  try {
    const postData = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ["username"],
        },
      ],
    });
    // Serialize data so the template can read it
    const posts = postData.map((post) => post.get({ plain: true }));
    // Pass serialized data and session flag into template
    res.render("homepage", {
      posts,
      logged_in: req.session.logged_in,
      username: req.session.username,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

//---------------------------------------------------------------------------//
//                              login route                                  //
//---------------------------------------------------------------------------//

router.get("/login", (req, res) => {
  const error = req.session.error;
  req.session.error = null; // Clear the error message
  req.session.save((err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Failed to save session");
    } else {
      res.render("login", { error });
    }
  });
});

router.post("/login", async (req, res) => {
  try {
    const userData = await User.findOne({
      where: { username: req.body.username },
    });

    if (!userData) {
      res
        .status(400)
        .json({ message: "Incorrect username or password, please try again" });
      return;
    }

    const validPassword = await userData.checkPassword(req.body.password);

    if (!validPassword) {
      res
        .status(400)
        .json({ message: "Incorrect username or password, please try again" });
      return;
    }

    req.session.user_id = userData.id;
    req.session.logged_in = true;
    req.session.username = userData.username;

    req.session.save((err) => {
      if (err) {
        res.status(500).json(err);
      } else {
        res.redirect("/dashboard");
      }
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

//---------------------------------------------------------------------------//
//                           Dashboard route                                 //
//---------------------------------------------------------------------------//
router.get("/dashboard", async (req, res) => {
  try {
    // Get user data
    const userData = await User.findByPk(req.session.user_id, {
      attributes: { exclude: ["password"] },
    });

    const user = userData.get({ plain: true });

    res.render("dashboard", {
      ...user,
      logged_in: req.session.logged_in,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

//---------------------------------------------------------------------------//
//                              Signup route                                 //
//---------------------------------------------------------------------------//

router.get("/signup", (req, res) => {
  const error = req.session.error;
  req.session.error = null; // Clear the error message
  req.session.save((err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Failed to save session");
    } else {
      res.render("signup", { error });
    }
  });
});

router.post("/signup", async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  // Regular expression for email validation
  const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;

  if (!emailRegex.test(email)) {
    req.session.error = "Invalid email address";
    req.session.save(() => {
      res.redirect("/signup");
    });
    return;
  }

  if (password !== confirmPassword) {
    req.session.error = "Passwords do not match";
    req.session.save(() => {
      res.redirect("/signup");
    });
    return;
  }

  // Handle signup logic here (e.g., create user in database)
  try {
    const newUser = await User.create({
      username,
      email,
      password,
    });

    // Set session variables to indicate that the user is logged in
    req.session.logged_in = true;
    req.session.username = username;
    req.session.user_id = newUser.id;

    // Save the session and then redirect to dashboard page
    req.session.save(() => {
      res.redirect("/dashboard");
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

//---------------------------------------------------------------------------//
//                              Logout route                                 //
//---------------------------------------------------------------------------//

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Failed to destroy session");
    } else {
      res.redirect("/");
    }
  });
});

module.exports = router;
