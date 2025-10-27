const express = require('express');
const router = express.Router();
const invCont = require('../controllers/inventory-controller');
const {SID} = require('../config/constants');

// LIST
router.get(`/api/inventory-${SID}`, invCont.listJson);
router.get(`/api/inventory-${SID}/:inventoryId`, invCont.getOneJson);

// NEW INV
router.post(`/api/inventory-${SID}`, invCont.createJson);

// UPDATE
router.put(`/api/inventory-${SID}/:inventoryId`, invCont.updateJson);

// DELETE
router.delete(`/api/inventory-${SID}/:inventoryId`, invCont.deleteJson);


//meta data
router.get(`/api/inventory-meta-${SID}`, invCont.metaJson);

module.exports = router;
