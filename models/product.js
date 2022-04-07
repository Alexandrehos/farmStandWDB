// Como a gente já esta conectado ao BD quando ele importar esse arquivo, nós não precisamos fazer o código da conexão
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    lowercase: true,
    enum: ["fruit", "vegetable", "dairy"],
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
