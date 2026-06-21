const jwt = require("jsonwebtoken");

const JWT_SETCRET = "myorderslipquthdata";

// Validate admin JWT and attach req.admin (admin user data)
const fetchadminusertoken = (req, res, next) => {
  const token = req.header("auth-token");

  if (!token) {
    return res.status(209).send({
      status: "Failed",
      msg: "Please authenticate using a valid token",
      error: "Please authenticate using a valid token",
    });
  }

  try {
    const data = jwt.verify(token, JWT_SETCRET);
    req.admin = data.admin || data.user; // keep backward compat with existing admin jwt shape
    next();
  } catch (error) {
    return res.status(209).send({
      status: "Failed",
      msg: "Please authenticate using a valid token",
      error: "Please authenticate using a valid token",
    });
  }
};

module.exports = fetchadminusertoken;
