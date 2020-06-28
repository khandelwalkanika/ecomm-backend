const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const fs = require("fs");
// Loading input validation
const multer = require("multer"); // for uploading , it sets the destination folder
const validateRegisterInput = require("../../models/validation/register");
const validateLoginInput = require("../../models/validation/login");
const validateCheckoutInput = require("../../models/validation/checkout");
// Loading User model
const User = require("../../models/user");
const Orders = require("../../models/orders");
const Products = require("../../models/products");

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
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
        userRole: req.body.userRole,
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
          role: user.userRole,
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
              userRole: user.userRole,
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
// multer({ storage: storage }).single("imagePath")
let upload = multer({ storage: storage });
router.post("/uploadProducts", upload.single("imagePath"), (req, res) => {
  try {
    const newProduct = new Products({
      productType: req.body.productType,
      productName: req.body.productName,
      price: req.body.price,
      imagePath: req.file ? req.file.filename : null,
      numOfItems: 0,
    });
    newProduct
      .save()
      .then((products) => res.json(products))
      .catch((err) => console.log(err));
  } catch (err) {
    console.log(err);
  }
});

//get products from the DB
router.get("/getProducts", (req, res) => {
  Products.find({}).then(function (products) {
    // let y = products;
    let folders = fs.readdirSync("public/images/uploads");
    console.log(folders, "<-----");
    products.forEach(function (eachItem) {
      eachItem.imagePath = folders;
    });

    res.send({ products });
  });
});

//get product by :id from db
router.route("/getProducts/:id").get(function (req, res) {
  let id = req.params.id;
  Products.findById(id, function (err, product) {
    // product.forEach(function (eachItem) {
    // product.iPath = `public/images/uploads/${product.imagePath}`;
    // });
    res.json(product);
  });
});

//update a product
router.post("/updateProduct/:id", upload.single("imagePath"), function (
  req,
  res
) {
  try {
    Products.findById(req.params.id, function (err, product) {
      if (!product) res.status(404).send("data is not found");
      else product.productName = req.body.productName;
      product.productType = req.body.productType;
      product.price = req.body.price;
      (product.imagePath = req.file ? req.file.filename : null),
        product
          .save()
          .then((product) => {
            Products.find({}).then(function (products) {
              res.send({ products });
            });
          })
          .catch((err) => {
            console.log(err);
          });
    });
  } catch (err) {
    console.log(err);
  }
});

//delete a product
router.delete("/deleteProduct/:id", function (req, res, next) {
  Products.findByIdAndRemove(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    // res.json(post);
    Products.find({}).then(function (products) {
      res.send({ products });
    });
  });
  // .find().pretty()
});

module.exports = router;
