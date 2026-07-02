const mongoose = require("mongoose");
const { Schema } = mongoose;

const catalogScheme = new Schema({
  userid: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },

  catalog_name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  nick_name: {
    type: String,
    trim: true,
  },
  products: [
    {
      p_id: { type: Schema.Types.ObjectId, ref: "product" },
    },
  ],
  customers: [
    {
      cus_id: { type: String },
    },
  ],
  flattDiscount: {
    type: Boolean,
    default: false,
  },
  discount: {
    type: Number,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
// we are createing new collection
// Hot queries
catalogScheme.index({ userid: 1 });

catalogScheme.index({ "customers.cus_id": 1 });
catalogScheme.index({ catalog_name: 1 });

const CatalogScheme = new mongoose.model("catalog", catalogScheme);
module.exports = CatalogScheme;
