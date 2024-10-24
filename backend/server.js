const express = require("express");
const mongoose = require("mongoose");
const dotenv = require('dotenv');
const cors = require('cors');  // Import cors package
const Counter = require('./models/Counter');
const saleRoutes = require('./routes/saleRoutes');

const itemRoutes = require('./routes/itemRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/auth');
dotenv.config();

const initializeCounter = async () => {
  try {
      const counter = await Counter.findById('itemCode');
      if (!counter) {
          await new Counter({ _id: 'itemCode', sequenceValue: 1000 }).save();
      }
  } catch (error) {
      console.error('Error initializing counter:', error.message);
  }
};

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware to parse JSON bodies
app.use(express.json());

app.use(cors()); // Use cors middleware

initializeCounter();

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
app.use('/api/category', categoryRoutes); 

// Routes
app.use('/api/sales', saleRoutes);

// Routes
app.use('/users', userRoutes);

app.use('/api/auth', authRoutes); // Mount your auth routes

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

console.log("hi");
console.log("hi");
