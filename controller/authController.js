const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ExpressError = require("../utils/ExpressError");

module.exports.signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  // 1. Validation Logic (Manual checks)
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    // Yahan ExpressError use kar sakte ho
    throw new ExpressError(409, existingUser.email === email ? "Email already exists" : "Username taken");
  }

  // 2. Hash & Save
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });
  await newUser.save();

  // 3. Token
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

  res.status(201).json({
    message: "User registered successfully",
    token,
    user: { id: newUser._id, username, email }
  });
};