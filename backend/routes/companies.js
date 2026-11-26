const express = require('express');
const router = express.Router();
const Company = require('../models/Company');

// 1. Register
router.post('/register', async (req, res) => {
  try {
    const { companyId } = req.body;
    const existing = await Company.findOne({ companyId });
    if (existing) return res.status(400).json({ message: 'Company ID already exists!' });

    const newCompany = new Company(req.body);
    const saved = await newCompany.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Get All 
router.get('/', async (req, res) => {
  try {
    const companies = await Company.find();
    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});                                                                        

// 3. Get by ID
router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});   

// 4. Update
router.put('/:id', async (req, res) => {
  try {
    const updated = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;