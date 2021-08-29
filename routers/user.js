const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
//User Model
const User = require("../models/User");
const auth = require("../middleware/auth");

//@route POST register
//@desc create user
//@access Public
router.post(
  "/register",
  [
    check("email", "email is required").not().isEmpty(),
    check("password", "password is required").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ error: [{ msg: "User email already registered" }] });
      }
      user = new User({
        email: req.body.email,
        password: req.body.password,
      });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
      const payload = {
        user: {
          id: user.id,
          email: user.email,
        },
      };
      res.json(payload);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

//@route POST login
//@desc Auth user and get token
//@access Public
router.post(
  "/login",
  [
    check("email", "Please enter a Valid email").not().isEmpty(),
    check("password", "Password required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }
      //decrypting password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Password incorrect" }] });
      }
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(payload, "token", { expiresIn: 36000 }, (err, token) => {
        if (err) throw err;
        res.json({ jwt: token });
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

//@route GET api/auth
//@desc send user data
//@access Public
router.get("/user", auth, async (req, res) => {
  //due to auth function it will send the id of the user in req
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ id: user._id, email: user.email });
  } catch (error) {
    res.status(500).send("Server error");
  }
});

module.exports = router;
