const password_validation = function(password) {
    const numeric_characters = /[0-9]/;
    const special_characters = /[#?!@$%^&*\-_\\\/]/;
    const capital_letters = /[A-Z]/;
    return password.match(special_characters) != undefined && 
            password.match(capital_letters) != undefined && 
            password.match(numeric_characters) != undefined && 
            password.length >= 8;
   };

module.exports = password_validation;
