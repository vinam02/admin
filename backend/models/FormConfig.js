const mongoose = require("mongoose");

const fieldSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    label: { type: String, default: "" },
    key: { type: String, required: true },
    required: { type: Boolean, default: false },
    options: [String],
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const formConfigSchema = new mongoose.Schema(
  {
    company: { type: String, default: "" },
    module: { type: String, required: true },   // 👈 enum hata diya taaki naye modules add ho sake
    fields: [fieldSchema],
    submissions: [submissionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("FormConfig", formConfigSchema);