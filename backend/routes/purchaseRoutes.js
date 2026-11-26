const express = require('express');
const router = express.Router();
const Purchase = require('../models/Purchase');  


const generateNextBillNumber = async () => {
  const lastPurchase = await Purchase.findOne().sort({ _id: -1 });
  let newSerial = 1;
  
  if (lastPurchase && lastPurchase.purchaseBillNo) {
    newSerial = Number(lastPurchase.purchaseBillNo) + 1; 
  }
  
  const paddedSerial = String(newSerial).padStart(3, '0');
  return {
    purchaseBillNo: paddedSerial,
    billNumber: `PUR/26-27/${paddedSerial}`
  }; 
};   

// 1. Naya Purchase Save karna (POST)
router.post('/', async (req, res) => {   
  try {
    const billInfo = await generateNextBillNumber();
    const purchaseData = {
      ...req.body,
      billNumber: billInfo.billNumber,
      purchaseBillNo: billInfo.purchaseBillNo
    };

    const newPurchase = new Purchase(purchaseData);   
    const savedPurchase = await newPurchase.save(); 
    res.status(201).json(savedPurchase); 
  } catch (error) {   
    console.log("Backend Purchase Error:", error); 
    res.status(500).json({ message: error.message });
  }
});

// 2. Saare Purchases ki list lana (GET)
router.get('/', async (req, res) => {   
  try {
    const purchases = await Purchase.find().sort({ _id: -1 });
    res.status(200).json(purchases);
  } catch (error) {     
    res.status(500).json({ message: error.message });
  }
});    

// 3. Frontend ko Agla Bill Number batane ke liye (GET)
router.get('/next-bill-number', async (req, res) => {
  try {
    const billInfo = await generateNextBillNumber();
    res.status(200).json(billInfo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});       

// 4. UPDATE PURCHASE (PUT)
router.put('/:id', async (req, res) => {
  try {
    const updatedPurchase = await Purchase.findByIdAndUpdate(
      req.params.id,
      { items: req.body.items, grandTotal: req.body.grandTotal },
      { new: true }
    );
    res.status(200).json(updatedPurchase);
  } catch (error) {
    console.log("Update Error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;                                   