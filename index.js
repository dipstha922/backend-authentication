const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());

const port = 3000;

// Replace this with your MongoDB connection string
const mongoURI =
  "mongodb+srv://sirjan:wNQWDeTjIx62IBN3@cluster0.xggyg.mongodb.net/";
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

app.use(bodyParser.json());

// Register endpoint
app.post("/register", async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  // Basic validation
  if (!firstname || !lastname || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check if the email is already registered
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Email already registered" });
  }

  // Create a new user in the database
  const newUser = new User({
    firstname,
    lastname,
    email,
    password,
  });

  await newUser.save();

  // Generate and send token
  const token = generateToken(newUser);
  res.json({ token });
});

// Login endpoint
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });

  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Generate and send token
  const token = generateToken(user);
  res.json({ token });
});

// Function to generate JWT token
function generateToken(user) {
  const { _id, email } = user;
  const tokenInfo = {
    token_type: "Bearer",
    exp: Math.floor(Date.now() / 1000) + 3600, // Token expiration time (1 hour)
    iat: Math.floor(Date.now() / 1000),
    jti: Math.random().toString(36).substring(7),
    user_id: _id,
    email,
  };

  const secretKey = "yourSecretKey"; // Replace with a secure key
  const token = jwt.sign(tokenInfo, secretKey);
  return token;
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
