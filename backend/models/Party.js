const mongoose = require('mongoose');

const partySchema = new mongoose.Schema({
  partyName: { type: String, required: true },
  partyNumber: { type: String, required: true },
  group: { type: String, enum: ['Sundry Creditor', 'Sundry Debtor'], required: true },
  state: { type: String, required: true },
  address: { type: String, required: true }
}, { strict: false });                                        

module.exports = mongoose.model('Party', partySchema);