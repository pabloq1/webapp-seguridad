/**
 * UTIL METHODS
 */

const password_validation = function(password) {
    var numeric_characters = /[0-9]/;
    var special_characters = /[#?!@$%^&*\-_\\\/]/;
    var capital_letters = /[A-Z]/;
    return password.match(special_characters) != undefined && 
            password.match(capital_letters) != undefined && 
            password.match(numeric_characters) != undefined && 
            password.length >= 8;
   };

module.exports = password_validation;

// Qwertyuiop1!