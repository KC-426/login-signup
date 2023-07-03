const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");

const app = express();

console.log('-----------------Start Server---------------------')

app.use(bodyParser.json()); 

app.use(authRoutes);

app.use((error, req, res, next) => {
  console.log(error)
  const status = error.status || 500
  const message = error.message
  const data = error.data
  res.status(status).json({ message: message, data: data})
})


mongoose
  .connect("mongodb+srv://kuldeep:18330468@cluster0.qw8m0tp.mongodb.net/apis")
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => console.log(err));
