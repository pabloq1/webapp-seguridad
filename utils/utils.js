/* PASSWORD */
const passwordValidation = function(password) {
    const numeric_characters = /[0-9]/;
    const special_characters = /[#?!@$%^&*\-_\\\/]/;
    const capital_letters = /[A-Z]/;
    return password.match(special_characters) != undefined && 
            password.match(capital_letters) != undefined && 
            password.match(numeric_characters) != undefined && 
            password.length >= 8;
   };

/* DATABASE */
const addMember = function(query, input) {
    db.query(query, [input], function(err, query_result) {
        if (err) throw err
    })
};

const addPersonToGroup = function(groupName, emailAddressNewUser, role) {
    SQL_CHECK_ADMIN = `SELECT * FROM ${process.env.DB_USUARIO_GRUPO_TABLE} WHERE nombreUser =? AND nombreGrupo =? AND agregar =?`
    SQL_ADD_NEW_MEMBER = ""
    new_member_input = {
            email: emailAddressNewUser,
            nombreGrupo: groupName,
            agrega: false,
            escribe: true,
            lee: true
        }
        // chequeo si soy el admin del grupo
    db.query(SQL_CHECK_ADMIN, [req.session.emailAddress, groupName, true], function(err, query_result, fields) {
        if (query_result.length > 0) {
            // tengo permiso de agregar
            switch (role) {
                case "Miembro":
                    SQL_ADD_NEW_MEMBER = `INSERT INTO ${process.env.DB_USUARIO_GRUPO_TABLE} SET ?`
                    utils.addMember(SQL_ADD_NEW_MEMBER, new_member_input)
                        // MOSTRAR ALGUN MENSAJE?
                    break;
                case "Administrador":
                    new_member_input.agrega = true
                    SQL_ADD_NEW_MEMBER = `INSERT INTO ${process.env.DB_USUARIO_GRUPO_TABLE} SET ?`
                    utils.addMember(SQL_ADD_NEW_MEMBER, new_member_input)
                    break;
                default:
                    console.log("NO MEMBER")
            }
        }
    })
};

//module.exports = password_validation, addMember, obtainUserGroups, addPersonToGroup;
exports.passwordValidation = passwordValidation
exports.addMember = addMember