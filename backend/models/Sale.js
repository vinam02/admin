const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  invoiceNumber: { type: String },
  date: { type: String },
  partyName: { type: String, required: true },
  items: { type: Array, default: [] },
  grandTotal: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);