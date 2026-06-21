// Initializes default roles for the existing admin + companies.
// Usage: node scripts/initRoles.js

require("../src/db/conn");
const mongoose = require("mongoose");

const Admin = require("../src/models/admin");
const Role = require("../src/models/role");
const Company = require("../src/models/company");

const ADMIN_PHONE = process.env.ADMIN_PHONE || "9999999999";

// Default role names + access matrix.
// Adjust these if your frontend expects different role labels.
const DEFAULT_ROLES = [
  {
    role_name: "super admin",
    access: [
      { type_name: "company", read: true, write: true, create: true },
      { type_name: "customer", read: true, write: true, create: true },
      { type_name: "category", read: true, write: true, create: true },
      { type_name: "staff", read: true, write: true, create: true },
      { type_name: "product", read: true, write: true, create: true },
      { type_name: "catalog", read: true, write: true, create: true },
      { type_name: "order", read: true, write: true, create: true },
      { type_name: "payment", read: true, write: true, create: true },
      { type_name: "inventory", read: true, write: true, create: true },
      { type_name: "invoice", read: true, write: true, create: true },
      { type_name: "subscription", read: true, write: true, create: true },
      { type_name: "settings", read: true, write: true, create: true },
      { type_name: "notification", read: true, write: true, create: true },
      { type_name: "role", read: true, write: true, create: true },
      { type_name: "invite", read: true, write: true, create: true },
    ],
  },
  {
    role_name: "staff",
    access: [
      { type_name: "company", read: true, write: false, create: false },
      { type_name: "customer", read: true, write: false, create: false },
      { type_name: "category", read: true, write: true, create: false },
      { type_name: "staff", read: true, write: false, create: false },
      { type_name: "product", read: true, write: true, create: false },
      { type_name: "catalog", read: true, write: false, create: false },
      { type_name: "order", read: true, write: true, create: false },
      { type_name: "payment", read: true, write: true, create: false },
      { type_name: "inventory", read: true, write: true, create: false },
      { type_name: "invoice", read: true, write: false, create: false },
      { type_name: "subscription", read: true, write: false, create: false },
      { type_name: "settings", read: false, write: false, create: false },
      { type_name: "notification", read: true, write: true, create: false },
      { type_name: "role", read: false, write: false, create: false },
      { type_name: "invite", read: true, write: false, create: false },
    ],
  },
];

async function main() {
  const admin = await Admin.findOne({ phone: Number(ADMIN_PHONE) });
  if (!admin) {
    console.error(
      `Admin not found for phone=${ADMIN_PHONE}. Run: node scripts/initAdmin.js first.`,
    );
    process.exit(1);
  }

  const companies = await Company.find({});
  if (!companies || companies.length === 0) {
    console.log(
      "No companies found. Seed companies first, then re-run initRoles.js.",
    );
    await mongoose.disconnect();
    return;
  }

  let created = 0;
  let skipped = 0;

  for (const com of companies) {
    console.log("running - ", created);

    const comId = com._id.toString();

    for (const r of DEFAULT_ROLES) {
      const exists = await Role.findOne({
        userid: admin.id,
        com_id: comId,
        role_name: r.role_name,
      });

      if (exists) {
        skipped++;
        continue;
      }

      await Role.create({
        userid: admin.id,
        com_id: comId,
        role_name: r.role_name,
        access: r.access,
      });
      created++;
    }
  }

  console.log({
    admin: admin.id,
    companies: companies.length,
    created,
    skipped,
  });

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
