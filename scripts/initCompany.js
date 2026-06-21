// Initializes a basic company record for the existing admin.
// Usage: node scripts/initCompany.js

require("../src/db/conn");
const mongoose = require("mongoose");

const Admin = require("../src/models/admin");
const Company = require("../src/models/company");

const ADMIN_PHONE = process.env.ADMIN_PHONE || "9999999999";

// Basic seed. Update via env if needed.
const SEED_COMPANIES = [
  {
    com_name: process.env.COMPANY_NAME || "Default Company",
    bus_type: process.env.COMPANY_BUS_TYPE || "Retail",
    indus_type: process.env.COMPANY_INDUS_TYPE || "General",
    gst_no: process.env.COMPANY_GST || "",
    email: process.env.COMPANY_EMAIL || "",
    com_phone: Number(process.env.COMPANY_PHONE || "9999999998"),
    address: process.env.COMPANY_ADDRESS || "",
    state: process.env.COMPANY_STATE || "",
    zipcode: Number(process.env.COMPANY_ZIP || "0"),
    country: process.env.COMPANY_COUNTRY || "India",
    com_image: process.env.COMPANY_IMAGE || "",
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

  let created = 0;
  let skipped = 0;

  for (const seed of SEED_COMPANIES) {
    // idempotent by unique com_name
    const exists = await Company.findOne({
      userid: admin.id,
      com_name: seed.com_name,
    });

    if (exists) {
      skipped++;
      continue;
    }

    await Company.create({
      userid: admin.id,
      ...seed,
    });

    created++;
  }

  console.log({ admin: admin.id, created, skipped });
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
