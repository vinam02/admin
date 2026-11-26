const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');

// Auto invoice number (INV-0001, INV-0002...)
// Ye route '/:id' wale route se PEHLE hona chahiye
router.get('/next-invoice-number', async (req, res) => {
  try {
    const last = await Sale.findOne({ invoiceNumber: /^INV-/ }).sort({ createdAt: -1 });
    const lastNo = last ? parseInt(last.invoiceNumber.replace('INV-', ''), 10) : 0;
    const next = 'INV-' + String(lastNo + 1).padStart(4, '0');
    res.json({ invoiceNumber: next });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Sab sales list
router.get('/', async (req, res) => {
  try {
    const sales = await Sale.find().sort({ createdAt: -1 });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Nayi sale save 
router.post('/', async (req, res) => {
  try {
    const last = await Sale.findOne({ invoiceNumber: /^INV-/ }).sort({ createdAt: -1 });
    const lastNo = last ? parseInt(last.invoiceNumber.replace('INV-', ''), 10) : 0;
    const invoiceNumber = 'INV-' + String(lastNo + 1).padStart(4, '0'); 

    const sale = new Sale({ ...req.body, invoiceNumber });
    await sale.save();
    res.status(201).json(sale);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;