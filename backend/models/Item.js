const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({   //ae  batata hai ki Database me data kis format me save hoga.
  itemName: { type: String, required: true }, 
  itemCode: { type: String, required: true },  //required: true: Reason: Ye field bharna compulsory hai, khali chhoda toh error aayega.

  hsnCode: { type: String, required: true },
  uom: { type: String, enum: ['pc', 'Nos', 'Kg', 'Lit', 'Box'], required: true },
  tax: { type: String, enum: ['0%', '5%', '12%', '18%', '28%'], required: true }, // Validation ke liye. User sirf inhi options me se select kar sakta hai.
  pPrice: { type: Number, required: true },
  sPrice:{type:Number, required: true},
  mrp: { type: Number, required: true },
  openingStock: { type: Number, required: true }
 }, { strict: false }); 
  


module.exports = mongoose.model('Item', itemSchema);