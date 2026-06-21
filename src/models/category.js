const mongoose = require("mongoose");
const { Schema } = mongoose;

const categorySchema = new Schema({
  userid: {
    type: String,
    required: true,
  },
  cat_name: {
    type: String, // This will store the "Make" (e.g., "APRILIA")
    required: true,
    trim: true,
  },
  // Deeply nested sub-items to support the complete flow
  sub_items: [
    {
      model_name: { type: String, required: true }, // e.g., "RSV4" or "ALL MODELS"
      years: [
        {
          year_val: { type: Number, required: true }, // e.g., 1999
          variants: [
            {
              variant_name: { type: String, required: true }, // e.g., "Factory", "RR"
              created: { type: Date, default: Date.now },
            },
          ],
        },
      ],
    },
  ],
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

// Creating the model collection
const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
