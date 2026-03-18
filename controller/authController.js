const User = require("../models/user");
const TravelProfile = require("../models/travelProfile");
const BusinessProfile = require("../models/businessProfile");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ExpressError = require("../utils/ExpressError");

module.exports.signup = async (req, res, next) => {
  const { username, email, password, accountType } = req.body;

  // 1. Validation
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new ExpressError(409, existingUser.email === email ? "Email already exists" : "Username taken");
  }

  // 2. Hash Password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // 3. Create User Instance
  const newUser = new User({ 
    username, 
    email, 
    password: hashedPassword,
    roles: [] // Array clear karke shuru karein
  });

  try {
    // 4. Profile Creation Logic
    if (accountType === "NORMAL" || accountType === "MIXED") {
      const tProfile = await TravelProfile.create({ user: newUser._id });
      newUser.travelProfile = tProfile._id;
      newUser.roles.push("NORMAL");
    }

    if (accountType === "BUSINESS" || accountType === "MIXED") {
      const bProfile = await BusinessProfile.create({ user: newUser._id });
      newUser.businessProfile = bProfile._id;
      newUser.roles.push("BUSINESS");
    }

    // 5. Final Save
    await newUser.save();

    // 6. Token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: newUser._id, username, email, roles: newUser.roles }
    });

  } catch (err) {
    // if profile creation fail then delete half created user (Cleanup)
    if (newUser._id) await User.findByIdAndDelete(newUser._id);
    next(err);
  }
};