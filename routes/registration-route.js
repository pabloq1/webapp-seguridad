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
    inputUserData = {
        name: req.body.first_name,
        lastname: req.body.last_name,
        email: req.body.email_address,
        password: req.body.password,
        gender: req.body.gender
    }

    inputGroupData = {
        nombreGrupo: req.body.group_name,
        adminGrupo: req.body.email_address
    }

    /* DATABASE */
    var sql_email = `SELECT * FROM ${process.env.DB_USUARIO_TABLE} WHERE email =?`;
    var sql_group = `SELECT * FROM ${process.env.DB_GRUPO_TABLE} WHERE nombreGrupo =?`;

    db.query(sql_email, [inputUserData.email], function (err, query_result, fields) {
        if(err) throw err
        if(query_result.length > 0){
            // check unique email address
            var msg = constants.OTHER_EMAIL
            res.render('registration-form', { alertMsg:msg,     
                passwordInfo:constants.PASSWORD_CHARACTERS });
        } else if (req.body.confirm_password != inputUserData.password){
            var msg = constants.PASSWORDS_NOT_MATCHING
            res.render('registration-form', { alertMsg:msg,     
                passwordInfo:constants.PASSWORD_CHARACTERS });
        } else if (!validation(inputUserData.password)) {
            var msg = constants.PASSWORD_FORMAT
            res.render('registration-form', { alertMsg:msg,     
                passwordInfo:constants.PASSWORD_CHARACTERS });
        } else {
            db.query(sql_group, [inputGroupData.nombreGrupo], function(err, query_group_result, fields){
                if (query_group_result.length > 0){
                    var msg = constants.GROUP_NAME_EXISTS
                    res.render('registration-form', { alertMsg:msg,     
                        passwordInfo:constants.PASSWORD_CHARACTERS });
                } else {
                    inputUserData.password = bcrypt.hashSync(inputUserData.password, saltRounds)
        
                    var sql_email = `INSERT INTO ${process.env.DB_USUARIO_TABLE} SET ?`
                    var sql_group = `INSERT INTO ${process.env.DB_GRUPO_TABLE} SET ?`
        
                    db.query(sql_email, [inputUserData], function (err, query_result) {
                        if (err) throw err;
                    })
        
                    db.query(sql_group, [inputGroupData], function (err, query_result) {
                        if (err) throw err;
                    })

                    var msg = constants.REGISTER_SUCCESS;
                    res.render('registration-form', { alertMsg:msg,     
                        passwordInfo:constants.PASSWORD_CHARACTERS });
                }
            })
        }
    })
});
module.exports = router;