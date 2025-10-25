const mongoose = require('mongoose');

const MEAL_TYPES   = ['Breakfast','Lunch','Dinner','Snack','Dessert'];
const DIFFICULTIES = ['Easy','Medium','Hard'];
const CUISINE      = [
  'Asian','European','american','Chinese','Italian','Indian','French','Japanese',
  'Mexican','Thai','Filipino','Greek','Mediterranean','Fusion','Other'
];

const recipeSchema = new mongoose.Schema({
  recipeId: {
    type: String,
    required: true,
    unique: true,
    match: /^R-\d{5}$/ // R-00001
  },
  userId: { 
    type: String
  },
  title: {
    type: String,
    required: true,
    minlength: 3,
    trim: true
  },
  chef: {
    type: String,
    required: true,
    trim: true
  },
  ingredients: {
    type: [String],
    validate: {
      validator: (arr) => Array.isArray(arr) && arr.length > 0 && arr.every(s => String(s).trim().length > 0),
      message: 'At least one ingredient is required.'
    }
  },
  instructions: {
    type: [String],
    validate: {
      validator: (arr) => Array.isArray(arr) && arr.length > 0 && arr.every(s => String(s).trim().length > 0),
      message: 'At least one step is required.'
    }
  },
  mealType: {
    type: String,
    enum: MEAL_TYPES,
    required: true
  },
  cuisineType: {
    type: String,
    enum: CUISINE,
    required: true
  },
  prepTime: {
    type: Number,
    min: [1, 'Prep time must be a positive number.'],
    required: true
  },
  difficulty: {
    type: String,
    enum: DIFFICULTIES,
    required: true
  },
  servings: {
    type: Number,
    min: [1, 'Servings must be a positive integer.'],
    validate: {
      validator: Number.isInteger,
      message: 'Servings must be an integer.'
    },
    required: true
  },
  createdDate: {
    type: String, //YYYY-MM-DD
    default: () => new Date().toISOString().slice(0, 10)
  }
}, { versionKey: false });
recipeSchema.index({ userId: 1 });
recipeSchema.index({ title: 1 });

module.exports = mongoose.model('Recipe', recipeSchema);
