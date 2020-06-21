const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const ProductSchema = new Schema({
  id: {
    type: String,
    required: true,
  },

  productType: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: false,
  },
  price: {
    type: String,
    required: true,
  },
  imagePath: {
    type: String,
    required: true,
  },
  numOfItems: {
    type: String,
    required: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
module.exports = Products = mongoose.model("Products", ProductSchema);
