const express = require('express');
const router = express.Router();
const invCont = require('../controllers/inventory-controller');
const {SID} = require('../config/constants');

// LIST
router.get(`/inventory-${SID}`, invCont.list);

// NEW INV
router.get(`/inventory/add-${SID}`, invCont.newForm);
router.post(`/inventory/add-${SID}`, invCont.create);

// VIEW
router.get(`/inventory/view-${SID}/:inventoryId`, invCont.view);

// DELETE
router.post(`/inventory/delete-${SID}/:inventoryId`, invCont.remove);

//EDIT
router.get(`/inventory/edit-${SID}/:inventoryId`, invCont.editForm);
router.post(`/inventory/edit-${SID}/:inventoryId`, invCont.update);

router.get(`/api/inventory-${SID}`, invCont.listJson);
router.get(`/api/inventory-${SID}/:inventoryId`, invCont.getOneJson);
router.post(`/api/inventory-${SID}`, invCont.createJson);
router.put(`/api/inventory-${SID}/:inventoryId`, invCont.updateJson);
router.delete(`/api/inventory-${SID}/:inventoryId`, invCont.removeJson);


module.exports = router;
