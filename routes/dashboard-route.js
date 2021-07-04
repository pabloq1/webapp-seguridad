const express = require('express')
const router = express.Router()
const db = require('../database')
const bcrypt = require('bcrypt')
const constants = require('../utils/constants')

/* GET dashboard form */
router.get('/user/dashboard', function(req, res, next) {
    if (req.session.loggedInUser) {
        res.render('dashboard-form', {email:req.session.emailAddress})
    } else {
        res.redirect('/user/register')
    }
  });

module.exports = router;


