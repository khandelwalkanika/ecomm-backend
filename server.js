const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const passport = require("passport");
const users = require("./routes/api/users");
const cors = require("cors");
const multer = require("multer");
// Bodyparser middleware
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(cors()); // always before router...

//used when image was uploaded
var publicDir = require("path").join(__dirname, "/public/images/uploads");
app.use(express.static(publicDir));

// app.use(express.static("public/images/uploads"));
// app.use(express.static("files"));
// app.use("/static", express.static(path.join(__dirname, "public")));
// app.use("/static", express.static("public/images/uploads"));
// DB Config
const db = require("./config/keys").mongoURI;

//var url = "mongodb://localhost:27017/ecomm-local";
// MongoClient.connect(url, function (err, db) {
//   assert.equal(null, err);
//   // db.db("ecomm-local")
//   //   .collections()
//   //   .then((res) => res.forEach((r) => console.log(r.collectionName)));
//   // db.connect();
// });

mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB successfully connected"))
  .catch((err) => console.log(err));

app.use((req, res, next) => {
  // console.log("req.method", req.method);
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  ); // hack after getting cors error
  // res.header("Access-Control-Allow-Methods", "GET,PUT, POST,DELETE");
  next();
  // if ("OPTIONS" == req.method) {
  //   res.send(200);
  // } else {
  //   next();
  // }
});

// Passport middleware
app.use(passport.initialize());
// Passport config
require("./config/passport")(passport);
// Routes
app.use("/api/users", users);

const port = process.env.PORT || 5000; // process.env.port is Heroku's port if you choose to deploy the app there
app.listen(port, () => console.log(`Server up and running on port ${port} !`));
