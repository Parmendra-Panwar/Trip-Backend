if (process.env.NODE_ENV != "production") {
  require('dotenv').config();
}

const express = require("express");
const app = express();
const cors = require("cors");
const ExpressError = require("./utils/ExpressError.js");
const connectDB = require("./config/db");

// Routes Import
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const usersRouter = require("./routes/users.js");
const authRouter = require("./routes/authrouter.js");

// MongoDB connection
connectDB();

// Middlewares
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Add JSON body parser

// Root Route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to TripLinker API" });
});

// Use Routes
app.use("/api/v1/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/api/v1/auth/login", usersRouter);
app.use("/api/v1/auth/signup", authRouter);

// 404 Handler
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Route not found"));
});

// Global Error Handler
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).json({
    success: false,
    error: message,
    statusCode
  });
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});