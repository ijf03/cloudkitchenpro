const Inventory = require('../models/inventory');

const UNIT_OPTS = Inventory.schema.path('unit')?.enumValues || ['grams','kg','ml','litres','cups','tsp','tbsp','pieces','slices','bunches'];
const CAT_OPTS  = Inventory.schema.path('category')?.enumValues || [
  'Vegetables','Fruits','Dairy','Meat','Seafood','Grains','Baking Supplies','Spices & Herbs',
  'Condiments','Beverages','Snacks','Other'
];
const LOC_OPTS  = Inventory.schema.path('location')?.enumValues || ['Pantry','Fridge','Freezer','Other'];
const LOW_STOCK_THRESHOLD = 5;

const today = new Date().toISOString().slice(0,10);

async function uniqueInventoryId(Model) { // makes a new unique id 
  const last = await Model.findOne({}, { inventoryId: 1 })
    .sort({ inventoryId: -1 })
    .lean();

  const lastNum = last
    ? parseInt(last.inventoryId.split('-')[1], 10)
    : 0;

  return `I-${String(lastNum + 1).padStart(5, '0')}`;
}

function requireLogin(req, res) { // checks if someone is logged in
  if (!req.currentUser) {
    res.status(403).render('errors/404', { pageTitle: 'Forbidden', url: req.originalUrl });
    return false;
  }
  return true;
}

// GET inventory
exports.list = async (req, res, next) => {
  if (!requireLogin(req, res)) return;
  try {
    const SID = req.app.locals.SID;
    const filters = {
      q: (req.query.q || '').trim(),
      category: req.query.category || '',
      location: req.query.location || '',
      sort: req.query.sort || ''
    };

    const find = {};
    if (filters.q) {
      const rx = new RegExp(filters.q, 'i');
      find.$or = [
        { ingredientName: rx },
        { category: rx },
        { location: rx }
      ];
    }
    if (filters.category) find.category = filters.category;
    if (filters.location) find.location = filters.location;

    let docs = await Inventory.find(find).lean();
    docs = docs.map(d => ({
      ...d,
      lowStock: Number(d.quantity) < LOW_STOCK_THRESHOLD
    }));

    // sort "YYYY-MM-DD"
    if (filters.sort === 'expAsc')  docs.sort((a,b) => String(a.expirationDate||'9999').localeCompare(String(b.expirationDate||'9999')));
    if (filters.sort === 'expDesc') docs.sort((a,b) => String(b.expirationDate||'0000').localeCompare(String(a.expirationDate||'0000')));


    res.render('inventory/inv_list', {
      pageTitle: 'Inventory',
      SID,
      inventory: docs,
      filters,
      F: filters,
      categories: CAT_OPTS,
      locations: LOC_OPTS,
      lowStockThreshold: LOW_STOCK_THRESHOLD 
    });
  } catch (err) { next(err); }
};

// GET new item
exports.newForm = (req, res) => {
  if (!requireLogin(req, res)) return;
  res.render('inventory/inv_new', {
    pageTitle: 'New Inventory Item',
    SID: req.app.locals.SID,
    form: {},
    error: null,
    units: UNIT_OPTS,
    categories: CAT_OPTS,
    locations: LOC_OPTS
  });
};

// POST new item
exports.create = async (req, res, next) => {
  if (!requireLogin(req, res)) return;
  try {
    const SID = req.app.locals.SID;
    const form = req.body;

    const doc = {
      inventoryId: await uniqueInventoryId(Inventory),
      userId: req.body.userId || 'U-00001',
      ingredientName: form.ingredientName,
      quantity: Number(form.quantity),
      unit: form.unit,
      category: form.category,
      location: form.location,
      purchaseDate: String(form.purchaseDate || '').trim(),
      expirationDate: String(form.expirationDate || '').trim(),
      cost: Number(form.cost || 0),
      createdDate: new Date().toISOString().slice(0,10)
    };

    await Inventory.create(doc);
    res.redirect(`/inventory-${SID}${req.userIdParam ? ('?userId=' + req.userIdParam) : ''}`);
  } catch (err) {
    res.status(400).render('inventory/inv_new', {
      pageTitle: 'New Inventory Item',
      SID: req.app.locals.SID,
      form: req.body,
      error: err.message,
      units: UNIT_OPTS,
      categories: CAT_OPTS,
      locations: LOC_OPTS
    });
  }
};

// GET inv
exports.view = async (req, res, next) => {
  if (!requireLogin(req, res)) return;
  try {
    const doc = await Inventory.findOne({ inventoryId: req.params.inventoryId }).lean();
    if (!doc) {
      return res.status(404).render('errors/404', { pageTitle: 'Not Found', url: req.originalUrl });
    }
    res.render('inventory/inv_view', {
      pageTitle: doc.ingredientName,
      SID: req.app.locals.SID,
      item: doc
    });
  } catch (err) { next(err); }
};

// POST delete inv by id
exports.remove = async (req, res, next) => {
  if (!requireLogin(req, res)) return;
  try {
    const SID = req.app.locals.SID;
    await Inventory.deleteOne({ inventoryId: req.params.inventoryId });
    res.redirect(`/inventory-${SID}${req.userIdParam ? ('?userId=' + req.userIdParam) : ''}`);
  } catch (err) { next(err); }
};

exports.expiringSoon = async (req, res, next) => {
  if (!requireLogin(req, res)) return;
  try {
    const soon = new Date();
    soon.setDate(soon.getDate() + 7); //in 7 days
    const docs = await Inventory.find({
      expirationDate: { $lte: soon.toISOString().slice(0,10) }
    }).lean();

    res.render('inventory/expiring', {
      pageTitle: 'Expiring Soon',
      SID: req.app.locals.SID,
      items: docs
    });
  } catch (err) { next(err); }
};

exports.value = async (req, res, next) => {
  if (!requireLogin(req, res)) return;
  try {
    const result = await Inventory.aggregate([
      { $group: { _id: null, totalValue: { $sum: { $multiply: ["$quantity", "$cost"] } } } }
    ]);
    const totalValue = result[0]?.totalValue || 0;

    res.render('inventory/value', {
      pageTitle: 'Inventory Value',
      SID: req.app.locals.SID,
      totalValue
    });
  } catch (err) { next(err); }
};

exports.editForm = async (req, res, next) => {
  if (!requireLogin(req, res)) return;
  try {
    const item = await Inventory.findOne({ inventoryId: req.params.inventoryId }).lean();
    if (!item) return res.status(404).render('errors/404', { pageTitle:'Not Found', url:req.originalUrl });

    res.render('inventory/inv_edit', {
      pageTitle: 'Edit Inventory',
      SID: req.app.locals.SID,
      form: item,
      units: UNIT_OPTS,
      categories: CAT_OPTS,
      locations: LOC_OPTS,
      error: null
    });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  if (!requireLogin(req, res)) return;
  try {
    const { inventoryId } = req.params;
    const form = req.body;
    await Inventory.updateOne({ inventoryId }, {
      $set: {
        ingredientName: form.ingredientName,
        quantity: Number(form.quantity),
        unit: form.unit,
        category: form.category,
        location: form.location,
        purchaseDate: form.purchaseDate,
        expirationDate: form.expirationDate,
        cost: Number(form.cost)
      }
    });
    res.redirect(`/inventory-${req.app.locals.SID}${req.userIdParam ? ('?userId=' + req.userIdParam) : ''}`);
  } catch (err) {
    res.status(400).render('inventory/inv_edit', {
      pageTitle: 'Edit Inventory',
      SID: req.app.locals.SID,
      form: req.body,
      units: UNIT_OPTS,
      categories: CAT_OPTS,
      locations: LOC_OPTS,
      error: err.message
    });
  }
};

function ensureLoginJson(req, res) {
  if (!req.currentUser) {
    res.status(403).json({ message: 'Forbidden (login required)' });
    return false;
  }
  return true;
}

exports.listJson = async (req, res, next) => {
  if (!ensureLoginJson(req, res)) return;
  try {
    const items = await Inventory.find({}).lean();
    res.json(items);
  } catch (e) { next(e); }
};

exports.getOneJson = async (req, res, next) => {
  if (!ensureLoginJson(req, res)) return;
  try {
    const doc = await Inventory.findOne({ inventoryId: req.params.inventoryId }).lean();
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (e) { next(e); }
};

exports.createJson = async (req, res) => {
  if (!ensureLoginJson(req, res)) return;
  try {
    const body = req.body || {};
    body.quantity = Number(body.quantity);
    body.cost = Number(body.cost);
    const created = await Inventory.create(body);
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ message: 'Create failed.' });
  }
};

exports.updateJson = async (req, res) => {
  if (!ensureLoginJson(req, res)) return;
  try {
    const body = req.body || {};
    body.quantity = Number(body.quantity);
    body.cost = Number(body.cost);
    const updated = await Inventory.findOneAndUpdate(
      { inventoryId: req.params.inventoryId }, { $set: body }, { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ message: 'Update failed.' });
  }
};

exports.removeJson = async (req, res) => {
  if (!ensureLoginJson(req, res)) return;
  await Inventory.deleteOne({ inventoryId: req.params.inventoryId });
  res.json({ ok: true });
};