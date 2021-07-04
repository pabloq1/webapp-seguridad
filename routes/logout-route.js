const express = require('express')
const router = express.Router()
const db = require('../database')
const bcrypt = require('bcrypt')
const constants = require('../utils/constants')

/* GET logout */
router.get('/logout', function(req, res, next) {
    req.session.destr
    res.redirect('/user/login');
});

module.exports = router;
