const express = require("express");
const mongoose = require("mongoose");
const dotenv = require('dotenv');

const itemRoutes = require('./routes/itemRoutes');
dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware to parse JSON bodies
app.use(express.json());

mongoose
  .connect(process.env.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

// Routes
app.use('/api/item', itemRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

console.log("hi");
console.log("hi");
