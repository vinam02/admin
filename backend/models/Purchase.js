const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  // Bill Number (Auto-generate hoga backend se)
  billNumber: { type: String, required: true }, 
  
  // Purchase Bill No (Manual type hoga, isliye required nahi kiya)
  purchaseBillNo: { type: String }, 

  date: { type: String, required: true },
  partyName: { type: String, required: true },
  
  items: [
    {
      itemName: { type: String, required: true },
      itemCode: { type: String }, 
      hsnCode: { type: String },
      qty: { type: Number, required: true },
      pPrice: { type: Number, required: true },
      discount: { type: Number },
      tax: { type: Number },
      netAmount: { type: Number, required: true }
    }
  ],
  grandTotal: { type: Number, required: true } 
});
         
module.exports = mongoose.model('Purchase', purchaseSchema);