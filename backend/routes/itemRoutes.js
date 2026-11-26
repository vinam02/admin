const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const Purchase = require('../models/Purchase');
const Sale = require('../models/Sale');
const FormConfig = require('../models/FormConfig');

const DEFAULT_ITEM_FIELDS = [
  { type: 'text', label: 'Item Name', key: 'itemName', required: true, options: [] },
  { type: 'text', label: 'Item Code', key: 'itemCode', required: true, options: [] },
  { type: 'text', label: 'HSN Code', key: 'hsnCode', required: true, options: [] },
  { type: 'dropdown', label: 'UOM', key: 'uom', required: true, options: ['pc', 'Nos', 'Kg', 'Lit', 'Box'] },
  { type: 'dropdown', label: 'Tax', key: 'tax', required: true, options: ['0%', '5%', '12%', '18%', '28%'] },
  { type: 'number', label: 'P.Price', key: 'pPrice', required: true, options: [] },
  { type: 'number', label: 'S.Price', key: 'sPrice', required: true, options: [] },
  { type: 'number', label: 'MRP', key: 'mrp', required: true, options: [] },
  { type: 'number', label: 'Opening Stock', key: 'openingStock', required: true, options: [] },
];

// 1. Create Item (POST)
router.post('/', async (req, res) => {
  try {
    const payload = { ...req.body };
    delete payload._skipFormSync;   // mongoose me na jaye

    const newItem = new Item(payload);
    const savedItem = await newItem.save();

    // Agar AllForms se aa raha hai to FormConfig duplicate mat banao
    if (!req.body._skipFormSync) {
      try {
        const company = req.body.company || '';
        let formConfig = await FormConfig.findOne({ module: 'Item', company });
        if (!formConfig) {
          formConfig = new FormConfig({
            module: 'Item',
            company,
            fields: DEFAULT_ITEM_FIELDS,
            submissions: [],
          });
        }
        formConfig.submissions.push({ data: JSON.parse(JSON.stringify(savedItem)) });
        await formConfig.save();
      } catch (formErr) {
        console.error('FormConfig create error:', formErr.message);
      }
    }

    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Get All Items (GET)
router.get('/', async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. STOCK REPORT (Sale minus karke)
router.get('/stock-report', async (req, res) => {
  try {
    const items = await Item.find();
    const purchases = await Purchase.find();
    const sales = await Sale.find();

    const stockData = items.map((item) => {
      let totalPurchased = 0;
      let totalSold = 0;

      purchases.forEach((purchase) => {
        purchase.items.forEach((pi) => {
          if (pi.itemCode === item.itemCode) {
            totalPurchased += Number(pi.qty);
          }
        });
      });

      sales.forEach((sale) => {
        sale.items.forEach((si) => {
          if (si.itemCode === item.itemCode) {
            totalSold += Number(si.qty);
          }
        });
      });

      const openingStock = Number(item.openingStock) || 0;
      const currentStock = openingStock + totalPurchased - totalSold;

      return {
        _id: item._id,
        itemName: item.itemName,
        itemCode: item.itemCode,
        uom: item.uom,
        currentStock,
      };
    });

    res.status(200).json(stockData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. STOCK LEDGER
router.get('/:id/stock-ledger', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const purchases = await Purchase.find();
    const sales = await Sale.find();

    const entries = [];

    purchases.forEach((p) => {
      p.items.forEach((line) => {
        if (line.itemCode === item.itemCode) {
          entries.push({
            date: p.date || p.createdAt,
            type: 'Purchase',
            partyName: p.partyName || '-',
            billNo: p.purchaseBillNo || p.billNumber || '-',
            qty: Number(line.qty),
          });
        }
      });
    });

    sales.forEach((s) => {
      s.items.forEach((line) => {
        if (line.itemCode === item.itemCode) {
          entries.push({
            date: s.date || s.createdAt,
            type: 'Sale',
            partyName: s.partyName || '-',
            billNo: s.invoiceNumber || '-',
            qty: Number(line.qty),
          });
        }
      });
    });

    entries.sort((a, b) => new Date(a.date) - new Date(b.date));

    let running = Number(item.openingStock) || 0;
    const ledger = entries.map((e) => {
      if (e.type === 'Purchase') running += e.qty;
      else running -= e.qty;
      return { ...e, currentStock: running };
    });

    res.json({
      item: {
        _id: item._id,
        itemCode: item.itemCode,
        itemName: item.itemName,
        uom: item.uom,
        currentStock: running,
      },
      ledger,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. Update Item (PUT)
router.put('/:id', async (req, res) => {
  try {
    const payload = { ...req.body };
    delete payload._skipFormSync;

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, payload, { new: true });

    // FormConfig ki submission bhi update karo
    try {
      const formConfig = await FormConfig.findOne({ module: 'Item', company: req.body.company || '' });
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

    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 6. Delete Item (DELETE)
router.delete('/:id', async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);

    try {
      const formConfig = await FormConfig.findOne({ module: 'Item' });
      if (formConfig) {
        formConfig.submissions = formConfig.submissions.filter(
          (s) => String(s.data?._id) !== String(req.params.id)
        );
        await formConfig.save();
      }
    } catch (formErr) {
      console.error('FormConfig delete error:', formErr.message);
    }

    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;