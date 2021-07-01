var express = require('express');
var router = express.Router();
var db=require('../database');
// const { passwordValidation } = require('../utils/utils');
const validation = require('../utils/utils')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = `${process.env.PLAIN_PASS}`;

// to display registration form 
router.get('/register', function(req, res, next) {
  res.render('registration-form');
});

/**
 * INPUT LOGIC on POST
 */

router.post('/register', function(req, res, next) {
    inputData ={
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email_address: req.body.email_address,
        gender: req.body.gender,
        password: req.body.password,
        confirm_password: req.body.confirm_password
    }

    /**
     * DATABASE LOGIC
     */

    // check unique email address
    var sql='SELECT * FROM registration WHERE email_address =?';
    db.query(sql, [inputData.email_address], function (err, data, fields) {
        if(err) throw err

        if(data.length > 1){
            var msg = inputData.email_address+ "was already exist";
        } else if (inputData.confirm_password != inputData.password){
            var msg ="Password & Confirm Password is not Matched";
        } else if (!validation(inputData.password)) {
            var msg ="Passwords ALGO MENSAJE";
        } else {
        /* -- SAVE USER INTO DATABASE -- */
            /* -- HASH -- */
            inputData.password = bcrypt.hashSync(inputData.password, saltRounds);
            inputData.confirm_password = bcrypt.hashSync(inputData.confirm_password, saltRounds);
            var sql = 'INSERT INTO registration SET ?';
            db.query(sql, inputData, function (err, data) {
            if (err) throw err;
            });
        var msg ="Your are successfully registered";
        }

        res.render('registration-form',{alertMsg:msg});
    })
     
});
module.exports = router;