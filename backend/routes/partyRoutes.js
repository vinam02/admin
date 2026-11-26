const express = require('express');
const router = express.Router();
const Party = require('../models/Party');
const FormConfig = require('../models/FormConfig');

const DEFAULT_PARTY_FIELDS = [
  { type: 'text', label: 'Party Name', key: 'partyName', required: true, options: [] },
  { type: 'text', label: 'Party Number', key: 'partyNumber', required: true, options: [] },
  { type: 'dropdown', label: 'Group', key: 'group', required: true, options: ['Sundry Creditor', 'Sundry Debtor'] },
  { type: 'text', label: 'State', key: 'state', required: true, options: [] },
  { type: 'textarea', label: 'Address', key: 'address', required: true, options: [] },
];

// 1. Create Party (POST)
router.post('/', async (req, res) => {
  try {
    const payload = { ...req.body };
    delete payload._skipFormSync;

    const newParty = new Party(payload);
    const savedParty = await newParty.save();

    if (!req.body._skipFormSync) {
      try {
        const company = req.body.company || '';
        let formConfig = await FormConfig.findOne({ module: 'Party', company });
        if (!formConfig) {
          formConfig = new FormConfig({
            module: 'Party',
            company,
            fields: DEFAULT_PARTY_FIELDS,
            submissions: [],
          });
        }
        formConfig.submissions.push({ data: JSON.parse(JSON.stringify(savedParty)) });
        await formConfig.save();
      } catch (formErr) {
        console.error('FormConfig create error:', formErr.message);
      }
    }

    res.status(201).json(savedParty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Get All Parties (GET)
router.get('/', async (req, res) => {
  try {
    const parties = await Party.find();
    res.status(200).json(parties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. Update Party (PUT)
router.put('/:id', async (req, res) => {
  try {
    const payload = { ...req.body };
    delete payload._skipFormSync;

    const updatedParty = await Party.findByIdAndUpdate(req.params.id, payload, { new: true });

    try {
      const formConfig = await FormConfig.findOne({ module: 'Party', company: req.body.company || '' });
      if (formConfig) {
        const sub = formConfig.submissions.find(
          (s) => String(s.data?._id) === String(req.params.id)
        );
        if (sub) {
          sub.data = { ...sub.data, ...payload };
          await formConfig.save();
        }
      }
    } catch (formErr) {
      console.error('FormConfig update error:', formErr.message);
    }

    res.status(200).json(updatedParty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. Delete Party (DELETE)
router.delete('/:id', async (req, res) => {
  try {
    await Party.findByIdAndDelete(req.params.id);

    try {
      const formConfig = await FormConfig.findOne({ module: 'Party' });
      if (formConfig) {
        formConfig.submissions = formConfig.submissions.filter(
          (s) => String(s.data?._id) !== String(req.params.id)
        );
        await formConfig.save();
      }
    } catch (formErr) {
      console.error('FormConfig delete error:', formErr.message);
    }

    res.status(200).json({ message: 'Party deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;