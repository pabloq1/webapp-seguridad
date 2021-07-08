const express = require('express');
const router = express.Router();
const db = require('../database');
const utils = require('../utils/utils');
const bcrypt = require('bcrypt');
const saltRounds = parseInt(`${process.env.SALT}`);
const constants = require('../utils/constants')

router.get('/register', function(req, res, next) {
    res.render('registration-form', { registration: constants.REGISTRATION });
});

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

    inputGroupUserData = {
        nombreUser: req.body.email_address,
        nombreGrupo: req.body.group_name,
        agrega: true,
        escribe: true,
        lee: true
    }

    var sql_email = `SELECT * FROM ${process.env.DB_USUARIO_TABLE} WHERE email =?`;
    var sql_group = `SELECT * FROM ${process.env.DB_GRUPO_TABLE} WHERE nombreGrupo =?`;

    db.query(sql_email, [inputUserData.email], function(err, query_result, fields) {
        if (err) throw err
        if (query_result.length > 0) {
            // check unique email address
            var msg = constants.OTHER_EMAIL
            res.render('registration-form', {
                alertMsg: msg,
                passwordInfo: constants.PASSWORD_CHARACTERS
            });
        } else if (req.body.confirm_password != inputUserData.password) {
            var msg = constants.PASSWORDS_NOT_MATCHING
            res.render('registration-form', {
                alertMsg: msg,
                passwordInfo: constants.PASSWORD_CHARACTERS
            });
        } else if (!utils.passwordValidation(inputUserData.password)) {
            var msg = constants.PASSWORD_FORMAT
            res.render('registration-form', {
                alertMsg: msg,
                passwordInfo: constants.PASSWORD_CHARACTERS
            });
        } else {
            db.query(sql_group, [inputGroupData.nombreGrupo], function(err, query_group_result, fields) {
                if (query_group_result.length > 0) {
                    var msg = constants.GROUP_NAME_EXISTS
                    res.render('registration-form', {
                        alertMsg: msg,
                        passwordInfo: constants.PASSWORD_CHARACTERS
                    });
                } else {
                    inputUserData.password = bcrypt.hashSync(inputUserData.password, saltRounds)

                    var sql_email_insert = `INSERT INTO ${process.env.DB_USUARIO_TABLE} SET ?`
                    var sql_group_insert = `INSERT INTO ${process.env.DB_GRUPO_TABLE} SET ?`
                    var sql_user_group_insert = `INSERT INTO ${process.env.DB_USUARIO_GRUPO_TABLE} SET ?`

                    db.query(sql_email_insert, [inputUserData], function(err, query_result) {
                        if (err) throw err;
                    })

                    db.query(sql_group_insert, [inputGroupData], function(err, query_result) {
                        if (err) throw err;
                    })

                    db.query(sql_user_group_insert, [inputGroupUserData], function(err, query_result) {
                        if (err) throw err;
                    })

                    var msg = constants.REGISTER_SUCCESS;
                    res.render('registration-form', {
                        alertMsg: msg,
                        passwordInfo: constants.PASSWORD_CHARACTERS
                    });
                }
            })
        }
    })
});
module.exports = router;