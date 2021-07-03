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
    var SQL_STATEMENT = `SELECT * FROM ${process.env.DB_NAME} WHERE email_address=?`  /*Deberia devolver uno solo (1 cuenta por direccion de email) */
    db.query(SQL_STATEMENT, [inputData.email_address], function (err, query_result, fields) {
        console.log(query_result)
        if(err) throw err
        if (!(query_result.length > 0) || !validation(inputData.password)) {
            var msg = constants.INVALID_CREDENTIALS
            res.render('login-form', { alertMsg:msg });
        } else {
            /* query_result[0] because only one mail is allowed */
            bcrypt.compare(inputData.password, query_result[0].password, (err, data) => {
                if (err) throw err
                if (data) {
                    req.session.loggedinUser = true
                    req.session.emailAddress = inputData.email_address
                    console.log("SE LOGUEO BIEN")
                    // res.redirect('/dashboard');
                } else {
                    var msg = constants.INVALID_CREDENTIALS
                    res.render('login-form', { alertMsg:msg });
                }
            })   
        }
    });
});
module.exports = router;