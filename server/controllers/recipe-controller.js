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
const toLines = (s) => String(s || '')
  .split(/[\r\n,]+/)
  .map(x => x.trim())
  .filter(Boolean);

exports.create = async (req, res, next) => {
  if (!requireChef(req, res)) return;
  try {
    const f = req.body;

    const dup = await Recipe.findOne({ title: new RegExp(`^${f.title}$`, 'i') }).lean();
    if (dup) {
      return res.status(400).render('recipes/recipe_new', {
        pageTitle: 'Add New Recipe',
        SID: req.app.locals.SID,
        form: req.body,
        mealTypes: MEAL, cuisines: CUI, difficulties: DIFF,
        error: 'A recipe with that title already exists.'
      });
    }

    const doc = {
      recipeId: await nextRecipeId(),
      userId: req.currentUser.userId,
      title: String(f.title || '').trim(),
      chef: req.currentUser.fullName,
      mealType: f.mealType,
      cuisineType: f.cuisineType,
      prepTime: Number(f.prepTime),
      difficulty: f.difficulty,
      servings: Number(f.servings),
      ingredients: toLines(f.ingredients),
      instructions: toLines(f.instructions),
      createdDate: new Date().toISOString().slice(0, 10)
    };

    await Recipe.create(doc);
    res.redirect(`/recipes-${req.app.locals.SID}${req.userIdParam ? ('?userId=' + req.userIdParam) : ''}`); 
  } catch (err) {
    console.error('[createRecipe] error', {
      code: err.code,
      keyPattern: err.keyPattern,
      keyValue: err.keyValue,
      message: err.message
    });
  }
};

//GET recipe by id
exports.view = async (req, res, next) => {
  try {
    if (!requireChef(req, res)) return;
    const id = req.params.recipeId;
    const or = [{ recipeId: id }];
    if (Types.ObjectId.isValid(id)) or.push({ _id: id });

    const recipe = await Recipe.findOne({ $or: or }).lean();
    if (!recipe) {
      return res.status(404).render('errors/404', {
        pageTitle: 'Not Found',
        url: req.originalUrl
      });
    }

    res.render('recipes/recipe_view', {
      pageTitle: recipe.title,
      SID: req.app.locals.SID,
      recipe
    });
  } catch (err) { next(err); }
};

// POST delete recipe by id
exports.remove = async (req, res, next) => {
  try {
    if (!requireChef(req, res)) return;

    const id = req.params.recipeId;
    const or = [{ recipeId: id }];
    const existing = await Recipe.findOne({ $or: or }).lean();
    if (!existing) {
      return res.redirect(`/recipes-${req.app.locals.SID}${req.userIdParam ? ('?userId=' + req.userIdParam) : ''}`);
    }
    if (existing.userId !== req.currentUser.userId) {
      return res.redirect(`/recipes-${req.app.locals.SID}${req.userIdParam ? ('?userId=' + req.userIdParam + '&') : '?'}msg=Cannot%20delete%20another%20chef%27s%20recipe`);
    }

    await Recipe.deleteOne({ $or: or, userId: req.currentUser.userId });
    return res.redirect(`/recipes-${req.app.locals.SID}${req.userIdParam ? ('?userId=' + req.userIdParam) : ''}`);
  } catch (err) { next(err); }
};

// GET edit recipe form
exports.editForm = async (req, res, next) => {
  try {
    if (!requireChef(req, res)) return;

    const id = req.params.recipeId;
    const or = [{ recipeId: id }];
    const recipe = await Recipe.findOne({ $or: or }).lean();
    if (!recipe) return res.status(404).render('errors/404', { pageTitle: 'Not Found', url: req.originalUrl });

    if (recipe.userId !== req.currentUser.userId) {
      const newId = await duplicateRecipeForUser(recipe, req.currentUser);
      return res.redirect(`/recipes/edit-${req.app.locals.SID}/${newId}${req.userIdParam ? ('?userId=' + req.userIdParam) : ''}`);
    } 

    // owner can edit normally
    return res.render('recipes/recipe_edit', {
      pageTitle: 'Edit Recipe',
      SID: req.app.locals.SID,
      form: recipe,
      mealTypes: MEAL, cuisines: CUI, difficulties: DIFF,
      error: null
    });
  } catch (err) { next(err); }
};

// POST update
exports.update = async (req, res, next) => {
  try {
if (!requireChef(req, res)) return;

const id = req.params.recipeId;
const or = [{ recipeId: id }];
const existing = await Recipe.findOne({ $or: or }).lean();
if (!existing) {
  return res.status(404).render('errors/404', { pageTitle: 'Not Found', url: req.originalUrl });
}

// if not owner, make copy
if (existing.userId !== req.currentUser.userId) {
  const newId = await duplicateRecipeForUser(existing, req.currentUser, {
    title: String(req.body.title || existing.title).trim(),
    mealType: req.body.mealType || existing.mealType,
    cuisineType: req.body.cuisineType || existing.cuisineType,
    prepTime: Number(req.body.prepTime || existing.prepTime),
    difficulty: req.body.difficulty || existing.difficulty,
    servings: Number(req.body.servings || existing.servings),
    ingredients: toLines(req.body.ingredients || existing.ingredients.join('\n')),
    instructions: toLines(req.body.instructions || existing.instructions.join('\n')),
  });
  return res.redirect(`/recipes-${req.app.locals.SID}${req.userIdParam ? ('?userId=' + req.userIdParam + '&') : '?'}msg=Recipe%20updated`);
}

// if owner, then:
await Recipe.updateOne({ $or: or, userId: req.currentUser.userId }, {
  $set: {
    title: String(req.body.title || '').trim(),
    chef: req.currentUser.fullName, // auto assign
    mealType: req.body.mealType,
    cuisineType: req.body.cuisineType,
    prepTime: Number(req.body.prepTime),
    difficulty: req.body.difficulty,
    servings: Number(req.body.servings),
    ingredients: toLines(req.body.ingredients),
    instructions: toLines(req.body.instructions),
  }
}, { runValidators: true });

return res.redirect(`/recipes-${req.app.locals.SID}${req.userIdParam ? ('?userId=' + req.userIdParam + '&') : '?'}msg=Recipe%20updated`);
  } catch (err) {
    res.status(400).render('recipes/recipe_edit', {
      pageTitle: 'Edit Recipe',
      SID: req.app.locals.SID,
      form: { ...req.body, recipeId: req.params.recipeId },
      mealTypes: MEAL,
      cuisines: CUI,
      difficulties: DIFF,
      error: err.message || 'Validation error.'
    });
  }
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
