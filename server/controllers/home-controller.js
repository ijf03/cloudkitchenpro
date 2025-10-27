const User = require('../models/user');
const Recipe = require('../models/recipe');
const Inventory = require('../models/inventory');

exports.getHome = (_req, res) => {
  res.redirect('/dashboard');
};

exports.statsJson = async (req, res, next) => {
  try {
    const User = require('../models/user');
    const Recipe = require('../models/recipe');
    const Inventory = require('../models/inventory');

    const { currentUser } = req;

    // basic counts
    const [userCount, recipeCount, inventoryCount] = await Promise.all([
      User.countDocuments(),
      Recipe.countDocuments(),
      Inventory.countDocuments()
    ]);

    // total inventory value
    const valueAgg = await Inventory.aggregate([
      { $group: { _id: null, totalValue: { $sum: "$cost" } } }
    ]);
    const inventoryValue = valueAgg[0]?.totalValue || 0;

    // expiring in 7 days (inclusive)
    const today = new Date();
    const soon = new Date();
    soon.setDate(soon.getDate() + 7);
    const todayISO = today.toISOString().slice(0, 10);
    const soonISO  = soon.toISOString().slice(0, 10);

    const expiringSoonCount = await Inventory.countDocuments({
      expirationDate: { $gte: todayISO, $lte: soonISO }
    });

    // per user recipes (only for chefs)
    let myRecipeCount = null;
    if (currentUser?.role === 'chef') {
      myRecipeCount = await Recipe.countDocuments({ userId: currentUser.userId });
    }

    res.json({
      userCount,
      recipeCount,
      inventoryCount,
      inventoryValue,
      expiringSoonCount,
      myRecipeCount,
      role: currentUser?.role || null,
      currentUserName: currentUser?.fullName || null
    });
  } catch (err) {
    next(err);
  }
};
