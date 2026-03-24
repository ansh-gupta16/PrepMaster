const jwt = require("jsonwebtoken");

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // No token, but it's optional, so proceed without req.user
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id
    };
    next();
  } catch (error) {
    // Token invalid, but it's optional, so proceed without req.user
    next();
  }
};

module.exports = optionalAuth;
