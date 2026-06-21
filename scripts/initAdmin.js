// Initializes an admin record (idempotent by phone)
// Usage: node scripts/initAdmin.js
require("../src/db/conn");
const mongoose = require("mongoose");

const Admin = require("../src/models/admin");

const JWT_SETCRET = "myorderslipquthdata"; // kept for reference; not used here

const ADMIN_SEED = {
  phone: "9999999999",
  pass: "12345678",
};

async function main() {
  // Ensure env variables / conn.js side effects already provide connection
  // Prefer using existing db/conn.js if it creates the mongoose connection.
  // But since this script is standalone, we connect directly using MONGODB_URI if present.

  // Find by phone (admin schema uses Number)
  const existing = await Admin.findOne({ phone: Number(ADMIN_SEED.phone) });
  if (existing) {
    console.log("Admin already exists for phone:", ADMIN_SEED.phone);
    await mongoose.disconnect();
    return;
  }

  // Hash password
  const bcrypt = require("bcryptjs");
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(ADMIN_SEED.pass, salt);

  const admin = await Admin.create({
    fullname: "Admin",
    email: "",
    phone: Number(ADMIN_SEED.phone),
    password: hashed,
    createAt: new Date(),
  });

  console.log("Seeded admin:", {
    id: admin._id.toString(),
    phone: ADMIN_SEED.phone,
  });

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
