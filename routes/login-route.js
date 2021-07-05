const express = require('express')
const router = express.Router()
const db = require('../database')
const validation = require('../utils/utils')
const bcrypt = require('bcrypt')
const saltRounds = parseInt(`${process.env.SALT}`)
const myPlaintextPassword = `${process.env.PLAIN_PASS}`;
const constants = require('../utils/constants')


router.get('/login', function(req, res, next) {
    res.render('login-form', { userLogin: constants.USER_LOGIN, newRegistration: constants.NEW_REGISTRATION })
});

router.post('/login', function(req, res, next) {
    inputData = {
        email: req.body.email_address,
        password: req.body.password
    }

    /* check if email exists on DB */
    var SQL_STATEMENT = `SELECT * FROM ${process.env.DB_USUARIO_TABLE} WHERE email=?` /*Deberia devolver uno solo (1 cuenta por direccion de email) */
    db.query(SQL_STATEMENT, [inputData.email], function(err, query_result, fields) {
        if (err) throw err
        if (!(query_result.length > 0) || !validation(inputData.password)) {
            var msg = constants.INVALID_CREDENTIALS
            res.render('login-form', { alertMsg: msg, userLogin: constants.USER_LOGIN, newRegistration: constants.NEW_REGISTRATION });
        } else {
            /* query_result[0] because only one mail is allowed */
            bcrypt.compare(inputData.password, query_result[0].password, (err, data) => {
                if (err) throw err
                if (data) {
                        /**
                         * Storing in a cookie:
                         * 1. loggedInUser boolean
                         * 2. user email address
                         * */
                    req.session.loggedInUser = true
                    req.session.emailAddress = inputData.email
                    res.redirect('/user/dashboard');
                } else {
                    var msg = constants.INVALID_CREDENTIALS
                }
            })
        }
    });
});
module.exports = router;