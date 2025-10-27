const express = require('express');
const router = express.Router();
const homeController = require('../controllers/home-controller');
const { SID } = require('../config/constants');

router.get(`/api/dashboard-${SID}`, homeController.statsJson);

module.exports = router;
