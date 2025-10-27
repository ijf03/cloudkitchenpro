const Inventory = require('../models/inventory');

const UNIT_OPTS = Inventory.schema.path('unit')?.enumValues
const CAT_OPTS  = Inventory.schema.path('category')?.enumValues
const LOC_OPTS  = Inventory.schema.path('location')?.enumValues
const LOW_STOCK_THRESHOLD = 5;


async function uniqueInventoryId(Model) {
  const last = await Model.findOne({}, { inventoryId: 1 }).sort({ inventoryId: -1 }).lean();
  const lastNum = last ? parseInt((last.inventoryId || 'I-00000').split('-')[1], 10) : 0;
  return `I-${String(lastNum + 1).padStart(5, '0')}`;
}

exports.listJson = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    const userId = (req.query.userId || '').trim();

    const filter = {};
    if (q) {
      const rx = new RegExp(q, 'i');
      filter.$or = [
        { ingredientName: rx },
        { category: rx },
        { location: rx },
      ];
    }
    if (userId) {
      filter.userId = userId;
    }

    const items = await Inventory.find(filter)
      .sort({ ingredientName: 1 })
      .lean();

    res.json(items);
  } catch (err) {
    next(err);
  }
};

exports.createJson = async (req, res) => {
  try {
    const b = req.body || {};
    const doc = {
      inventoryId: await uniqueInventoryId(Inventory),
      userId: b.userId || 'U-00001',
      ingredientName: b.ingredientName,
      quantity: Number(b.quantity),
      unit: b.unit,
      category: b.category,
      location: b.location,
      purchaseDate: String(b.purchaseDate || '').trim(),
      expirationDate: String(b.expirationDate || '').trim(),
      cost: Number(b.cost || 0),
      createdDate: new Date().toISOString().slice(0,10)
    };
    const created = await Inventory.create(doc);
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ message: 'Create failed', error: String(e.message || e) });
  }
};

exports.getOneJson = async (req, res, next) => {
  try {
    const { inventoryId } = req.params;
    const doc = await Inventory.findOne({ inventoryId }).lean();
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (e) { next(e); }
};

exports.updateJson = async (req, res, next) => {
  try {
    const { inventoryId } = req.params;
    const b = req.body || {};
    const updated = await Inventory.findOneAndUpdate(
      { inventoryId },
      {
        $set: {
          ingredientName: b.ingredientName,
          quantity: Number(b.quantity),
          unit: b.unit,
          category: b.category,
          location: b.location,
          purchaseDate: String(b.purchaseDate || '').trim(),
          expirationDate: String(b.expirationDate || '').trim(),
          cost: Number(b.cost || 0),
        }
      },
      { new: true }
    ).lean();
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (e) { next(e); }
};

exports.deleteJson = async (req, res, next) => {
  try {
    const { inventoryId } = req.params;
    const result = await Inventory.deleteOne({ inventoryId });
    res.json({ ok: result.deletedCount > 0 });
  } catch (e) { next(e); }
};


exports.metaJson = (req, res) => {
  res.json({
    units: UNIT_OPTS,
    categories: CAT_OPTS,
    locations: LOC_OPTS,
    lowStockThreshold: LOW_STOCK_THRESHOLD
  });
};