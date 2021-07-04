const express = require('express');
const router = express.Router();
const db=require('../database');
const validation = require('../utils/utils')
const bcrypt = require('bcrypt');
const saltRounds = parseInt(`${process.env.SALT}`)
const myPlaintextPassword = `${process.env.PLAIN_PASS}`;
const constants = require('../utils/constants')

/* GET registration form */
router.get('/register', function(req, res, next) {
  res.render('registration-form', {registration:constants.REGISTRATION});
});

/* USER INPUT */
router.post('/register', function(req, res, next) {
    inputData = {
        nombreUser: req.body.first_name,
        apellidoUser: req.body.last_name,
        email: req.body.email_address,
        gender: req.body.gender,
        password: req.body.password,
        confirm_password: req.body.confirm_password
    }

    /* DATABASE */
    var sql = `SELECT * FROM ${process.env.DB_USUARIO_TABLE} WHERE email =?`;
    db.query(sql, [inputData.email], function (err, query_result, fields) {
        console.log("hola")
        if(err) throw err
        if(query_result.length > 0){
            // check unique email address
            var msg = constants.OTHER_EMAIL
        } else if (inputData.confirm_password != inputData.password){
            var msg = constants.PASSWORDS_NOT_MATCHING
        } else if (!validation(inputData.password)) {
            var msg = constants.PASSWORD_FORMAT
        } else {
            inputData.password = bcrypt.hashSync(inputData.password, saltRounds)
            inputData.confirm_password = bcrypt.hashSync(inputData.confirm_password, saltRounds)
            var sql = `INSERT INTO ${process.env.DB_USUARIO_TABLE} SET ?`
            var sql_grupo = `INSERT INTO ${process.env.DB_USUARIO_GRUPO_TABLE} SET ?`
            db.query(sql, [inputData.nombreUser, inputData.email, inputData.password, inputData.gender], function (err, query_result) {
            if (err) throw err;
            })

            db.query(sql_grupo, [inputData.email, inputData.email], function (err, query_result) {
                if (err) throw err;
                })
            var msg = constants.REGISTER_SUCCESS;
        }
        res.render('registration-form', { alertMsg:msg,     
                                        passwordInfo:constants.PASSWORD_CHARACTERS });
    })
});
module.exports = router;