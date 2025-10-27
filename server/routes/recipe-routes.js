const express = require('express');
const router = express.Router();
const recipeCont = require('../controllers/recipe-controller');
const {SID} = require('../config/constants');

// LIST
router.get(`/api/recipes-${SID}`, recipeCont.listJson);

// NEW RECIPE
router.post(`/api/recipes-${SID}`, recipeCont.createJson);

// VIEW
router.get(`/api/recipes-${SID}/:recipeId`, recipeCont.getOneJson);

// DELETE
router.delete(`/api/recipes-${SID}/:recipeId`, recipeCont.deleteJson);

// EDIT
router.put(`/api/recipes-${SID}/:recipeId`, recipeCont.updateJson);

router.get(`/api/recipes-meta-${SID}`, recipeCont.metaJson);

module.exports = router;
