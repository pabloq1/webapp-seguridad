var express = require('express')
var router = express.Router()
var db = require('../database')
const validation = require('../utils/utils')
const bcrypt = require('bcrypt')
const saltRounds = 10
const myPlaintextPassword = `${process.env.PLAIN_PASS}`

// display login form 
router.get('/login', function(req, res, next) {
    res.render('login-form')
  })

router.post('/login', function(req, res, next) {
    inputData = {
        email_address: req.body.email_address,
        password: req.body.password
    }

    /* check if email exists on DB */
    var sql = `SELECT * FROM ${process.env.DB_NAME} WHERE email_address=?`
    db.query(sql, [inputData.email_address], function (err, data, fields) {
        
    })

})