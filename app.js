if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit"); // Rate limiter import
const ExpressError = require("./utils/ExpressError.js");
const connectDB = require("./config/db");

// 1. Database Connection
connectDB();

// 2. Security Middlewares
app.use(helmet()); 

// Rate Limiting Configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Har IP se max 100 requests per 15 mins
  standardHeaders: true, // Rate limit info 'RateLimit-*' headers mein bheje
  legacyHeaders: false, // 'X-RateLimit-*' headers disable kare
  message: {
    success: false,
    error: "Too many requests, please try again after 15 minutes.",
  },
});

// Saare routes par limiter apply karein
app.use("/api/", limiter);

// CORS Configuration
const allowedOrigins = [
  "https://triplinkers.vercel.app",
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy error'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 3. Routes
const listingsRouter = require("./routes/listing.js");
const activitiesRouter = require("./routes/activity.js");
const tripsRouter = require("./routes/trip.js");
const reviewsRouter = require("./routes/review.js");
const usersRouter = require("./routes/users.js");
const authRouter = require("./routes/authrouter.js");
const profileRouter = require("./routes/profile.js");

app.get("/", (req, res) => {
  res.json({ message: "TripLinker API is live and secure!" });
});

app.use("/api/v1/listings", listingsRouter);
app.use("/api/v1/activities", activitiesRouter);
app.use("/api/v1/trips", tripsRouter);
app.use("/api/v1/:type/:id/reviews", reviewsRouter);
app.use("/api/v1/auth/login", usersRouter);
app.use("/api/v1/auth/signup", authRouter);
app.use("/api/v1/profile", profileRouter);

// 4. Error Handlers
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Route not found"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).json({
    success: false,
    error: process.env.NODE_ENV === "production" ? message : err.stack,
    statusCode
  });
});

// 5. Port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});