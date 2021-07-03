var express = require('express')
var router = express.Router()
var db = require('../database')
const bcrypt = require('bcrypt')
const saltRounds = parseInt(`${process.env.SALT}`)
const myPlaintextPassword = `${process.env.PLAIN_PASS}`
const constants = require('../utils/constants')

// display dashboard form 
router.get('/dashboard', function(req, res, next) {
    if (req.session.loggedInUser) {
        res.render('dashboard-form', {email:req.session.emailAddress})
    } else {
        res.redirect('/register')
    }
  });

module.exports = router;


