const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  companyContact: { type: String, required: true },
  address: { type: String, required: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  companyId: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

module.exports = mongoose.model('Company', companySchema);