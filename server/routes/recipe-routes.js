const express = require('express');
const router = express.Router();
const recipeCont = require('../controllers/recipe-controller');
const {SID} = require('../config/constants');

// LIST
router.get(`/api/recipes-${SID}`, recipeCont.listJson);

// NEW RECIPE
router.get(`/recipe/add-${SID}`, recipeCont.newForm);
router.post(`/recipe/add-${SID}`, recipeCont.create);
router.post(`/recipes/duplicate-${SID}/:recipeId`, recipeCont.duplicate);

// VIEW
router.get(`/recipe/view-${SID}/:recipeId`, recipeCont.view);

// DELETE
router.post(`/recipe/delete-${SID}/:recipeId`, recipeCont.remove);

// EDIT
router.get(`/recipe/edit-${SID}/:recipeId`, recipeCont.editForm);
router.post(`/recipe/edit-${SID}/:recipeId`, recipeCont.update);

router.get(`/api/recipes-meta-${SID}`, recipeCont.metaJson);

module.exports = router;
