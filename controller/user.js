const User = require("../models/user")
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

module.exports.signUpGET = (req, res) => {
  res.render("users/Aten.ejs");
}

// module.exports.signUpPOST = async (req, res) => {
//   try {
//     const { username, email, password } = req.body;

//     // Validate input data
//     if (!username || !email || !password) {
//       req.flash("error", "Please fill in all fields.");
//       return res.redirect("/signup");
//     }

//     // Check if email is already in use
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       req.flash("error", "Email address already in use.");
//       return res.redirect("/signup");
//     }

//     // Create a new user
//     const newUser = new User({ email, username });
//     const registeredUser = await User.register(newUser, password);
//     req.login(registeredUser, (err) => {
//       if (err) {
//         return next();
//       }
//       req.flash("success", "Welcome to WonderLand!");
//       res.redirect("/listings");
//     })
//   } catch (e) {
//     // Handle specific errors
//     if (e.name === "ValidationError") {
//       req.flash("error", "Invalid input data.");
//     } else {
//       req.flash("error", "An error occurred. Please try again.");
//     }
//     res.redirect("/signup");
//   }
// }

module.exports.loginGET = (req, res) => {
  res.render("users/login.ejs");
}


module.exports.loginPOST = async (req, res) => {
  req.flash("success", "Welcome back to WonderLand!");
  let returnTo = req.session.returnTo || "/listings";
  res.redirect(returnTo);
}

module.exports.logoutUser = (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err) };
    req.flash("success", "You are logout");
    res.redirect("/listings")
  });
}