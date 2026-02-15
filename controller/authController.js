const User = require("../models/user");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Utility function to send emails
const sendVerificationEmail = (email, verificationCode) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'parmendrapanwar11@gmail.com',
      pass: 'pmds zckn ktic ocat' // Use your generated app password
    }
  });

  const mailOptions = {
    from: 'parmendrapanwar11@gmail.com',
    to: email,
    subject: 'TripLiker Email Verification',
    text: `Your verification code is: ${verificationCode}`
  };

  return transporter.sendMail(mailOptions);
};

// Signup POST to send verification email
module.exports.sendVerification = async (req, res) => {
  try {
    const { username, email, password } = req.body;  

    // Validate input
    if (!username || !email || !password) {
      req.flash("error", "Please fill in all fields.");
      return res.redirect("/signup");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("error", "Email is already registered.");
      return res.redirect("/signup");
    } else {
      // Check if username already exists
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        req.flash("error", "username is already registered.");
        return res.redirect("/signup");
      } else {
        // Generate a verification code
        const verificationCode = crypto.randomInt(100000, 999999); // 6-digit code
        req.session.verificationCode = verificationCode;
        req.session.userData = { username, email, password }; // Store user data in session

        // Send email with verification code
        await sendVerificationEmail(email, verificationCode);

        req.flash("success", "Verification code sent to your email.");
        res.redirect("/verify");
      }
    }
  } catch (error) {
    console.error("Error sending verification email:", error);
    req.flash("error", "Error sending verification email.");
    res.redirect("/signup");
  }
};

// POST route to verify the code
module.exports.verifyCode = async (req, res) => {
  const { verify } = req.body;

  if (verify === String(req.session.verificationCode)) {
    req.flash("success", "Verification successful!");
    try {
      const { username, email, password } = req.session.userData;
  
      // Create a new user
      const newUser = new User({ email, username });
      const registeredUser = await User.register(newUser, password); // Assuming you're using passport-local-mongoose
  
      // Automatically log in the user
      req.login(registeredUser, (err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "Welcome to TripLinker!");
        res.redirect("/listings");
      });
  
    } catch (error) {
      console.error("Error completing signup:", error);
      req.flash("error", "An error occurred during signup.");
      res.redirect("/signup");
    }
  } else {
    req.flash("error", "Invalid verification code.");
    res.redirect("/signup");
  }
};

// POST route to complete signup
// module.exports.completeSignup = async (req, res) => {
 
// };
