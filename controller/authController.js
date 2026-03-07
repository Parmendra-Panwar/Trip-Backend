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
      return res.status(400).json({ error: "Please fill in all fields." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email is already registered." });
    } else {
      // Check if username already exists
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(409).json({ error: "Username is already registered." });
      } else {
        // Generate a verification code
        const verificationCode = crypto.randomInt(100000, 999999); // 6-digit code
        req.session.verificationCode = verificationCode;
        req.session.userData = { username, email, password }; // Store user data in session

        // Send email with verification code
        await sendVerificationEmail(email, verificationCode);

        res.json({ message: "Verification code sent to your email." });
      }
    }
  } catch (error) {
    console.error("Error sending verification email:", error);
    res.status(500).json({ error: "Error sending verification email." });
  }
};

// POST route to verify the code
module.exports.verifyCode = async (req, res, next) => {
  const { verify } = req.body;

  if (verify === String(req.session.verificationCode)) {
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
        res.status(201).json({ message: "Welcome to TripLinker!", user: registeredUser });
      });
  
    } catch (error) {
      console.error("Error completing signup:", error);
      res.status(500).json({ error: "An error occurred during signup." });
    }
  } else {
    res.status(400).json({ error: "Invalid verification code." });
  }
};

// POST route to complete signup
// module.exports.completeSignup = async (req, res) => {
 
// };
