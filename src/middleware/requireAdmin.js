const Admin = require("../models/admin");

// Assumes req.admin.id (or req.admin) exists from fetchadminusertoken
const requireAdmin = async (req, res, next) => {
  try {
    const adminId = req.admin?.id || req.admin?._id;

    if (!adminId) {
      return res.status(401).json({ status: "Failed", msg: "Not Allowed" });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(401).json({ status: "Failed", msg: "Not Allowed" });
    }

    return next();
  } catch (e) {
    return res.status(500).json({
      status: "Failed",
      msg: "Some internal error",
      error: e.message,
    });
  }
};

module.exports = requireAdmin;
