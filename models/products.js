const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const ProductSchema = new Schema({
  productType: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  imagePath: {
    type: String,
    required: false,
  },
  numOfItems: {
    type: Number,
    required: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
module.exports = Products = mongoose.model("Products", ProductSchema);
