if (process.env.NODE_ENV != "production") {
  require('dotenv').config();
}
//basic 1 setup
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
//
const ExpressError = require("./utils/ExpressError.js");
const connectDB = require("./config/db");

//basic 2 setup or better experience 
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo")
const flash = require("connect-flash");

//a @nd a part 1 
const passport = require("passport");
const LocalStrategy = require("passport-local");

// requring model
const User = require("./models/user");

//Getting routers
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const usersRouter = require("./routes/users.js")
const authRouter = require("./routes/authrouter.js")

// MongoDB connection
connectDB();

//mongo store setup for session
const store = MongoStore.create({
  mongoUrl: process.env.MONGO_URL,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 60 * 60,
})

store.on("error", () => {
  console.log("Error in MONGO session store", err);
})

//SessionOptions
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  }
}

app.use(cookieParser("secretcode"));
app.use(session(sessionOptions))
app.use(flash());

//A&A
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Flash
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  console.log(req.user)
  res.locals.currUser = req.user;
  next();
})

app.get("/", (req, res) => {
  res.render("home.ejs");
})
app.get("/profile", (req, res) => {
  res.render("./users/Profile.ejs");
})

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", usersRouter);
app.use("/", authRouter);


//rendom
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

//errorhandling
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Somthing went Wrong" } = err;
  res.status(statusCode).render("error.ejs", { err });
  //res.status(statusCode).send(message);
});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
