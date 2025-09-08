function auth(req, res, next) {
  // Check if user session exists
  if (req.session && req.session.user) {
    req.user = req.session.user; // attach user info to req.user
    next();
  } else {
    // Not logged in
    return res.status(401).json({ msg: "Unauthorized. Please login." });
  }
}

module.exports = auth;
