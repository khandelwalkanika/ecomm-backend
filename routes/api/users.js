const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
// Loading input validation

const validateRegisterInput = require("../../models/validation/register");
const validateLoginInput = require("../../models/validation/login");
const validateCheckoutInput = require("../../models/validation/checkout");
// Loading User model
const User = require("../../models/user");
const Orders = require("../../models/orders");
const Products = require("../../models/products");
// @route POST api/users/register
// @desc Register user
// @access Public
router.post("/register", (req, res) => {
  // Form validation
  const { errors, isValid } = validateRegisterInput(req.body);
  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      });
      // Hash password before saving in database
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then((user) => res.json(user))
            .catch((err) => console.log(err));
        });
      });
    }
  });
});

// @route POST api/users/checkout
router.post("/checkout", (req, res) => {
  // Form validation
  const { errors, isValid } = validateCheckoutInput(req.body);
  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({ email: req.body.email }).then((user) => {
    const newOrder = new Orders({
      email: req.body.email,
      orderNumber: req.body.orderNumber,
      totalPrice: req.body.totalPrice,
      address: req.body.address,
      address2: req.body.address2,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
    });
    newOrder
      .save()
      .then((order) => res.json(order))
      .catch((err) => console.log(err));
  });
});

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post("/login", (req, res) => {
  // Form validation
  const { errors, isValid } = validateLoginInput(req.body);
  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const email = req.body.email;
  const password = req.body.password;
  // Find user by email
  User.findOne({ email }).then((user) => {
    // Check if user exists
    if (!user) {
      return res.status(404).json({ emailnotfound: "Email not found" });
    }
    // Check password
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        // User matched
        // Create JWT Payload
        const payload = {
          id: user.id,
          name: user.name,
        };
        // Sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          {
            expiresIn: 31556926, // 1 year in seconds
          },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token,
            });
          }
        );
      } else {
        return res
          .status(400)
          .json({ passwordincorrect: "Password incorrect" });
      }
    });
  });
});

//product listings API
router.post("/uploadProducts", (req, res) => {
  const newProduct = new Products({
    id: req.body.id,
    productType: req.body.ProductType,
    productName: req.body.ProductName,
    price: req.body.price,
    imagePath: req.body.imagePath,
    numOfItems: req.body.numOfItems,
  });

  newProduct
    .save()
    .then((products) => res.json(products))
    .catch((err) => console.log(err));
});

//get products from the DB
router.get("/getProducts", (req, res) => {
  console.log(res);
  Products.find({}).then(function (products) {
    res.send({ products });
  });
  //fetch('/users').then(res => res.json())
});

module.exports = router;
