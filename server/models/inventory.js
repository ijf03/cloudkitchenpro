const mongoose = require('mongoose');

const UNITS = ["pieces", "kg", "g", "liters", "ml", "cups", "tbsp", "tsp", "dozen"];
const CATEGORIES = [
  "Vegetables", "Fruits", "Meat", "Dairy", "Grains", "Spices", "Beverages", "Frozen", "Canned", "Other"
];
const LOCATIONS = ["Fridge", "Freezer", "Pantry", "Counter", "Cupboard"];

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD

const inventorySchema = new mongoose.Schema({
  inventoryId: {
    type: String,
    required: true,
    unique: true,
    match: /^I-\d{5}$/ // I-00001
  },
  userId: {
    type: String,
    default: ''
  },
  ingredientName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
    match: /^[A-Za-z\s-]+$/, // characters, no numbers or special characters except spaces and hyphens
    trim: true
  },
  quantity: {
    type: Number,
    min: [0.01, 'Quantity must be a positive number.'],
    required: true
  },
  unit: {
    type: String,
    enum: UNITS,
    required: true
  },
  category: {
    type: String,
    enum: CATEGORIES,
    required: true
  },
  purchaseDate: {
    type: String,
    required: true,
    validate: {
      validator: (v) => ISO_RE.test(v),
      message: 'purchaseDate must be YYYY-MM-DD.'
    }
  },
  expirationDate: {
    type: String,
    required: true,
    validate: [
      {
        validator: (v) => ISO_RE.test(v),
        message: 'expirationDate must be YYYY-MM-DD.'
      },
      {
        validator: function (v) {
          if (!ISO_RE.test(v) || !ISO_RE.test(this.purchaseDate)) return true;
          return new Date(v) >= new Date(this.purchaseDate);
        },
        message: 'expirationDate cannot be earlier than purchaseDate.'
      }
    ]
  },
  location: {
    type: String,
    enum: LOCATIONS,
    required: true
  },
  cost: {
    type: Number,
    min: [0.01, 'Cost must not be negative number.'],
    max: [999.99, 'Cost is too high.'],
    match: /^\d+(\.\d{1,2})?$/, // 2 decimal places
    required: true
  },
  createdDate: {
    type: String,
    default: () => new Date().toISOString().slice(0, 10)
  }
}, { versionKey: false });
inventorySchema.index({ ingredientName: 1 });
inventorySchema.index({ expirationDate: 1 });

module.exports = mongoose.model('Inventory', inventorySchema);
