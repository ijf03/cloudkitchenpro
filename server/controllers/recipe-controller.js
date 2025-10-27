const Recipe = require('../models/recipe');
const { Types } = require('mongoose');

// check for schema, use list if no schema
const MEAL = Recipe.schema.path('mealType')?.enumValues
const DIFF = Recipe.schema.path('difficulty')?.enumValues
const CUI  = Recipe.schema.path('cuisineType')?.enumValues

// helpers for unique R-00000 IDs
async function uniqueRecipeId(Model) {
  const last = await Model.findOne({}, { recipeId: 1 }).sort({ recipeId: -1 }).lean();
  const lastNum = last ? parseInt(last.recipeId.split('-')[1], 10) : 0;
  return `R-${String(lastNum + 1).padStart(5, '0')}`;
}


function forbid(res, req) {
  return res.status(403).render('errors/404', { pageTitle: 'Forbidden', url: req.originalUrl });
}

function requireChef(req, res) {
  if (!req.currentUser || req.currentUser.role !== 'chef') {
    forbid(res, req);
    return false;
  }
  return true;
}


async function duplicateRecipeForUser(orig, currentUser) {
  const newId = await nextRecipeId();
  const copy = {
    recipeId: newId,
    userId: currentUser.userId,
    title: `${orig.title} (Copy)`,
    chef: currentUser.fullName,
    mealType: orig.mealType,
    cuisineType: orig.cuisineType,
    prepTime: orig.prepTime,
    difficulty: orig.difficulty,
    servings: orig.servings,
    ingredients: Array.isArray(orig.ingredients) ? orig.ingredients : [],
    instructions: Array.isArray(orig.instructions) ? orig.instructions : [],
    createdDate: new Date().toISOString().slice(0, 10)
  };
  await Recipe.create(copy);
  return newId;
}

exports.metaJson = (req, res) => {
  res.json({ mealTypes: MEAL, difficulties: DIFF, cuisines: CUI });
};


//GET recipes
exports.listJson = async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    const meal = String(req.query.meal || '').trim();
    const cuisine = String(req.query.cuisine || '').trim();
    const difficulty = String(req.query.difficulty || '').trim();

    const find = {};
    if (q) {
      const rx = new RegExp(q, 'i');
      find.$or = [
        { title: rx },
        { chef: rx },
        { ingredients: rx },      // works if ingredients saved as strings
      ];
    }
    if (meal) find.mealType = meal;
    if (cuisine) find.cuisineType = cuisine;
    if (difficulty) find.difficulty = difficulty;

    const docs = await Recipe.find(find).sort({ title: 1 }).lean();
    res.json(docs);
  } catch (err) { next(err); }
};

// GET new recipe form
exports.newForm = (req, res) => {
  if (!requireChef(req, res)) return;

  res.render('recipes/recipe_new', {
    pageTitle: 'Add New Recipe',
    SID: req.app.locals.SID,
    form: {},
    mealTypes: MEAL,
    cuisines: CUI,
    difficulties: DIFF,
    error: null
  });
};

// Convert textarea to array
exports.createJson = async (req, res) => {
  try {
    const b = req.body || {};
    const doc = {
      recipeId: await uniqueRecipeId(Recipe),
      title: b.title,
      chef: b.chef,
      ingredients: Array.isArray(b.ingredients) ? b.ingredients : String(b.ingredients || '').split('\n').map(s => s.trim()).filter(Boolean),
      instructions: Array.isArray(b.instructions) ? b.instructions : String(b.instructions || '').split('\n').map(s => s.trim()).filter(Boolean),
      mealType: b.mealType,
      cuisineType: b.cuisineType,
      prepTime: Number(b.prepTime || 0),
      difficulty: b.difficulty,
      servings: Number(b.servings || 1),
      createdDate: new Date().toISOString().slice(0,10)
    };
    const saved = await Recipe.create(doc);
    res.status(201).json(saved);
  } catch (e) {
    res.status(400).json({ message: 'Create failed', error: String(e?.message || e) });
  }
};

//GET recipe by id
exports.getOneJson = async (req, res, next) => {
  try {
    const { recipeId } = req.params;
    const doc = await Recipe.findOne({ recipeId }).lean();
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (e) { next(e); }
};

// delete recipe by id
exports.deleteJson = async (req, res, next) => {
  try {
    const out = await Recipe.deleteOne({ recipeId: req.params.recipeId });
    res.json({ ok: out.deletedCount > 0 });
  } catch (e) { next(e); }
};

// edit recipe form
exports.updateJson = async (req, res, next) => {
  try {
    const { recipeId } = req.params;
    const b = req.body || {};
    const $set = {
      title: b.title,
      chef: b.chef,
      ingredients: Array.isArray(b.ingredients) ? b.ingredients : String(b.ingredients || '').split('\n').map(s => s.trim()).filter(Boolean),
      instructions: Array.isArray(b.instructions) ? b.instructions : String(b.instructions || '').split('\n').map(s => s.trim()).filter(Boolean),
      mealType: b.mealType,
      cuisineType: b.cuisineType,
      prepTime: Number(b.prepTime || 0),
      difficulty: b.difficulty,
      servings: Number(b.servings || 1),
    };
    const updated = await Recipe.findOneAndUpdate({ recipeId }, { $set }, { new: true }).lean();
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (e) { next(e); }
};

exports.duplicate = async (req, res, next) => {
  try {
    if (!requireChef(req, res)) return;
    const id = req.params.recipeId;
    const or = [{ recipeId: id }];
    const orig = await Recipe.findOne({ $or: or }).lean();
    if (!orig) {
      return res.status(404).render('errors/404', { pageTitle: 'Not Found', url: req.originalUrl });
    }
    const newId = await duplicateRecipeForUser(orig, req.currentUser);
    const q = req.userIdParam ? (`?userId=${req.userIdParam}&msg=Copied%20to%20your%20recipes`): `?msg=Copied%20to%20your%20recipes`;
    res.redirect(`/recipe/edit-${req.app.locals.SID}/${newId}${q}`);
  } catch (err) { next(err); }
};
