const express = require('express');
const router = express.Router();
const userCont = require('../controllers/user-controller');
const {SID} = require('../config/constants')

router.post(`/api/register-${SID}`, userCont.registerJson);

router.post(`/api/login-${SID}`, userCont.loginJson);

router.post(`/api/logout-${SID}`, userCont.logoutJson);

module.exports = router;
