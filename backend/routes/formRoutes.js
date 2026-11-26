const express = require('express');
const router = express.Router();
const FormConfig = require('../models/FormConfig');
const Item = require('../models/Item');
const Party = require('../models/Party');

// ─────────────────────────────────────────────
// 1. GET ALL FORMS (company filter ke saath)
//    GET /api/forms?company=xxx
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { company } = req.query;
    const query = company ? { company } : {};
    const forms = await FormConfig.find(query).sort({ createdAt: -1 });
    res.status(200).json(forms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─────────────────────────────────────────────
// 2. GET SINGLE FORM
//    GET /api/forms/:id
// ─────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const form = await FormConfig.findById(req.params.id);
    if (!form) return res.status(404).json({ message: 'Form not found' });
    res.status(200).json(form);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─────────────────────────────────────────────
// 3. CREATE FORM
//    POST /api/forms
// ─────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { module, company, fields } = req.body;
    if (!module || !Array.isArray(fields)) {
      return res.status(400).json({ message: 'module aur fields zaroori hain' });
    }

    const form = new FormConfig({
      module,
      company: company || '',
      fields,
      submissions: [],
    });
    const saved = await form.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─────────────────────────────────────────────
// 4. UPDATE FORM (AllForms ke "Save Update" ke liye)
//    PUT /api/forms/:id
// ─────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { module, fields } = req.body;

    const updatedForm = await FormConfig.findByIdAndUpdate(
      req.params.id,
      {
        ...(module && { module }),
        ...(Array.isArray(fields) && { fields }),
      },
      { new: true }
    );

    if (!updatedForm) return res.status(404).json({ message: 'Form not found' });
    res.status(200).json(updatedForm);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─────────────────────────────────────────────
// 5. UPDATE FIELDS ONLY (Party/Item page ke "Edit Form Fields" ke liye)
//    PUT /api/forms/:id/fields
// ─────────────────────────────────────────────
router.put('/:id/fields', async (req, res) => {
  try {
    const { fields } = req.body;
    if (!Array.isArray(fields)) {
      return res.status(400).json({ message: "Fields array zaroori hai" });
    }

    const updatedForm = await FormConfig.findByIdAndUpdate(
      req.params.id,
      { fields },
      { new: true }
    );

    if (!updatedForm) return res.status(404).json({ message: 'Form not found' });
    res.status(200).json(updatedForm);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─────────────────────────────────────────────
// 6. DELETE FORM (Item/Party data bhi delete karega)
//    DELETE /api/forms/:id
// ─────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const formConfig = await FormConfig.findById(req.params.id);
    if (!formConfig) return res.status(404).json({ message: 'Form not found' });

    // 1. FormConfig delete karo
    await FormConfig.findByIdAndDelete(req.params.id);

    // 2. FormConfig ki saari submissions ka data Item/Party collection se bhi delete karo
    try {
      const ids = formConfig.submissions
        .map((s) => s.data?._id)
        .filter(Boolean)
        .map((id) => String(id));

      if (ids.length > 0) {
        if (formConfig.module === 'Item') {
          await Item.deleteMany({ _id: { $in: ids } });
        } else if (formConfig.module === 'Party') {
          await Party.deleteMany({ _id: { $in: ids } });
        }
      }
    } catch (syncErr) {
      console.error('Sync delete error:', syncErr.message);
    }

    res.status(200).json({ message: 'Form deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─────────────────────────────────────────────
// 7. SUBMIT FORM DATA
//    POST /api/forms/:id/submit
// ─────────────────────────────────────────────
router.post('/:id/submit', async (req, res) => {
  try {
    const formConfig = await FormConfig.findById(req.params.id);
    if (!formConfig) return res.status(404).json({ message: 'Form not found' });

    const data = req.body.data || {};

    // 1. FormConfig me submission add karo
    formConfig.submissions.push({ data });
    await formConfig.save();

    // 2. Item/Party collection me bhi save karo
    try {
      if (formConfig.module === 'Item') {
        const newItem = new Item({
          ...data,
          company: formConfig.company || data.company || '',
        });
        await newItem.save();
      } else if (formConfig.module === 'Party') {
        const newParty = new Party({
          ...data,
          company: formConfig.company || data.company || '',
        });
        await newParty.save();
      }
    } catch (syncErr) {
      console.error('Item/Party sync error:', syncErr.message);
    }

    res.status(200).json({
      message: 'Form submitted successfully',
      submission: formConfig.submissions[formConfig.submissions.length - 1],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;