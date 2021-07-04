const express = require('express')
const router = express.Router()
const db = require('../database')
const bcrypt = require('bcrypt')
const constants = require('../utils/constants')

/* GET dashboard form */
router.get('/adminpage', function(req, res, next) {
    res.render('adminpage-form')
  });