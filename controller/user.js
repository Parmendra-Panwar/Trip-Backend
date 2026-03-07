const passport = require("passport");

module.exports.login = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    console.log("Login is called : >>>>>>>>>>>>>>", req.body);
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.json({ message: "Welcome back to TripLinker!", user });
    });
  })(req, res, next);
};

module.exports.logoutUser = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.json({ message: "You are logged out" });
  });
}