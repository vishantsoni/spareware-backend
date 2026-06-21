const jwt = require("jsonwebtoken");
const JWT_SETCRET = "myorderslipquthdata";
const fetchuser = (req, res, next) => {
  // GET the user fromteh jwt
  const token = req.header("auth-token");
  if (!token) {
    return res.status(209).send({status:"Failed", msg:"Please authenticate using a valid token",error: "Please authenticate using a valid token" });
  }
  try {
    const data = jwt.verify(token, JWT_SETCRET);
    req.user = data.user;
    next();
  } catch (error) {
   return res.status(209).send({status:"Failed", msg:"Please authenticate using a valid token", error: "Please authenticate using a valid token" });
  }
};
module.exports = fetchuser;
