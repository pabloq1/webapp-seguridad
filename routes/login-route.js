var express = require('express')
var router = express.Router()
var db = require('../database')
const validation = require('../utils/utils')
const bcrypt = require('bcrypt')
const saltRounds = 10
const myPlaintextPassword = `${process.env.PLAIN_PASS}`
const constants = require('../utils/constants')

// display login form 
router.get('/login', function(req, res, next) {
    res.render('login-form')
  });

router.post('/login', function(req, res, next) {
    inputData = {
        email_address: req.body.email_address,
        password: req.body.password
    }

    /* check if email exists on DB */
    var SQL_STATEMENT = `SELECT * FROM ${process.env.DB_NAME} WHERE email_address=? AND password=?`
    db.query(SQL_STATEMENT, [email_address, password], function (err, query_result, fields) {
        // query logic, PENDING PASSWORD CHECK
        if(err) throw err
        if (!(query_result.length > 0) || !validation(password)) {
            var msg = constants.INVALID_CREDENTIALS
        } else {
            req.session.loggedinUser = true
            req.session.emailAddress = email_address
            // res.redirect('/dashboard');
        }
        res.render('registration-form', { alertMsg:msg });
    });

});
module.exports = router;