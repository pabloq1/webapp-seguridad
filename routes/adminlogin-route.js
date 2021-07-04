const express = require('express')
const router = express.Router()
const db = require('../database')
const validation = require('../utils/utils')
const bcrypt = require('bcrypt')
const saltRounds = parseInt(`${process.env.SALT}`)
const myPlaintextPassword = `${process.env.PLAIN_PASS}`
const constants = require('../utils/constants')

/* GET login form */
router.get('/login', function(req, res, next) {
    res.render('adminlogin-form', { adminLogin:constants.ADMIN_LOGIN})
  });

router.post('/login', function(req, res, next) {
    inputData = {
        email_address: req.body.email_address,
        password: req.body.password
    }

    /* ACA CHEQUEAR CON DB TABLA ADMIN CAMBIAR TODO ?????? no mijo hay q adapatlo a  al tabla del admin nomas jajsa todo esto esta mal ? q onda*/
    
    var SQL_STATEMENT = `SELECT * FROM ${process.env.DB_NAME} WHERE email_address=?`  /*Deberia devolver uno solo (1 cuenta por direccion de email) */
    db.query(SQL_STATEMENT, [inputData.email_address], function (err, query_result, fields) {
        if(err) throw err
        if (!(query_result.length > 0) || !validation(inputData.password)) {
            var msg = constants.INVALID_CREDENTIALS
        } else {
            /* query_result[0] because only one mail is allowed */
            bcrypt.compare(inputData.password, query_result[0].password, (err, data) => {
                if (err) throw err
                if (data) {
                    req.session.loggedInUser = true
                    req.session.emailAddress = inputData.email_address
                    res.redirect('/user/dashboard');
                } else {
                    var msg = constants.INVALID_CREDENTIALS
                }
            })
        }
        res.render('login-form', { alertMsg:msg, userLogin:constants.USER_LOGIN, newRegistration:constants.NEW_REGISTRATION });
    });
});
module.exports = router;
