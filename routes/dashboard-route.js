const express = require('express')
const router = express.Router()
const db = require('../database')
const bcrypt = require('bcrypt')
const constants = require('../utils/constants')
const utils = require('../utils/utils');
const { query } = require('../database')


router.get('/', function(req, res, next) {
    obtainUserGroups(req, res)
})

router.get('/group', function(req, res, next) {
    if (req.session.loggedInUser) {
        res.render('group-form', {groupName: req.body.action})
    } else {
        res.redirect('/user/login')
    }
});

router.post('/group', function(req, res, next) {
     if (req.session.loggedInUser) {
         inputData = {
            groupName: req.body.group_name
         }
        obtenerPermisosGrupoUser(req, res, inputData.groupName)
        //obtenerRecursosGrupoUser(req, res, inputData.groupName)
        // addPersonToGroup(inputData.groupName, inputData.emailAddressNewUser, inputData.role)
   }
});

/* ------------------------------------------------------------------ */

const obtainUserGroups = function(req, res) {
    if (req.session.loggedInUser) {
        SQL_STATEMENT = `SELECT nombreGrupo FROM ${process.env.DB_USUARIO_GRUPO_TABLE} WHERE nombreUser =?`;
        var userGroupsList = []
        db.query(SQL_STATEMENT, [req.session.emailAddress], function(err, query_result, fields) {
            var numberOfGroups = 0
            if (query_result.length > 0) {
                numberOfGroups = query_result.length
                for (i = 0; i <= numberOfGroups - 1; i++) {
                    userGroupsList.push(query_result[i].nombreGrupo)
                }
            }
            res.render('dashboard-form', { email: req.session.emailAddress, groups: userGroupsList })
        })
    } else {
        res.redirect('/user/register')
    }
};

const obtenerPermisosGrupoUser = function(req, res, groupName) {
    if (req.session.loggedInUser) {
        SQL_STATEMENT = `SELECT * FROM ${process.env.DB_USUARIO_GRUPO_TABLE} WHERE nombreUser =? AND nombreGrupo =?`;
        var permisos;
        db.query(SQL_STATEMENT, [req.session.emailAddress, groupName], function(err, query_result, fields) {
            if (query_result.length > 0) {
                permisos = {
                    "agrega": query_result[0].agrega,
                    "lee": query_result[0].lee,
                    "escribe": query_result[0].escribe
                }  
                SQL_STATEMENT_RECURSOS = `SELECT nombreRecurso FROM ${process.env.DB_RECURSO_TABLE} WHERE grupo = ?`;
                db.query(SQL_STATEMENT_RECURSOS, [groupName], function(err,query_result,fields){
                    var nombresRecursos = []
                    console.log(query_result)
                    if(query_result.length > 0){
                        for (var i = 0; i < query_result.length; i++) {
                            var elem = query_result[i]
                            nombresRecursos.push(elem.nombreRecurso)
                        }                        
                        var msg = "Tiene Recursos"
                        console.log(msg)
                        
                        res.render('group-form', { email: req.session.emailAddress, permisos: permisos, groupname: groupName, recursos: nombresRecursos })
                    } else {
                        var msg = "El grupo no tiene Recursos"
                        console.log(msg)
                        res.render('group-form', { msg: msg, email: req.session.emailAddress, permisos: permisos, groupname: groupName, recursos: nombresRecursos })
                    }
                })
            }
        })
    } else {
        res.redirect('/user/register')
    }
}

/* const obtenerRecursosGrupoUser = function(req,res, groupName) {
    if (req.session.loggedInUser) {
        SQL_STATEMENT = `SELECT * FROM ${process.env.DB_USUARIO_GRUPO_TABLE} WHERE nombreUser = ? AND nombreGrupo = ?`;
        db.query(SQL_STATEMENT,[req.session.emailAddress, groupName], function(err,query_result,fields) {
            if(query_result.length > 0) {
                SQL_STATEMENT = `SELECT nombreRecurso FROM ${process.env.DB_RECURSO_TABLE} WHERE grupo = ?`;
                db.query(SQL_STATEMENT, [groupName], function(err,query_result,fields){
                    var nombresRecursos = []
                    if(query_result.length > 0){
                        for (elem in query_result) {
                            nombresRecursos.push(elem.nombreRecurso)
                        }
                        var msg = "Tiene Recursos"
                        console.log(msg)
                        res.render('group-form', { msg: msg, email: req.session.emailAddress, groupname: groupName, recursos: nombresRecursos })
                    } else {
                        var msg = "El grupo no tiene Recursos"
                        console.log(msg)
                        res.render('group-form', { msg: msg })
                    }
                })
            }
        })
    }
} */

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







// // Un Usuario Administrador de Grupo agrega a un Usuario al Grupo especificando si es Miembro o Administrador
// // Primero se chequea si ese Usuario tiene el permiso de Agregar en el Grupo especificado
// agregarPersona(emailUser,nombreGrupo,emailNuevoUsuario,rol){
//     //Chequeo si tengo esos permisos
//     resultSoyAdmin = SELECT * FROM UsuarioGrupo WHERE nombreUser = emailUser AND nombreGrupo = nombreGrupo AND agregar = True;
//     if(!resultSoyAdmin.empty){
//       // Tengo el permiso de Agregar! :)
//       if(rol='Miembro'){
//         resultNuevoMiembro = INSERT INTO UsuarioGrupo VALUES (emailNuevoUsuario,nombreGrupo,'-',false,true,true);
//         if(no devuelve error){
//           return 'Nuevo Miembro agregado satisfactoriamente'
//         }
//       }if else(rol='Administrador'){
//         resultNuevoAdmin = INSERT INTO UsuarioGrupo VALUES (emailNuevoUsuario,nombreGrupo,'-',true,true,true);
//         if(no devuelve error){
//           return 'Nuevo Administrador agregado satisfactoriamente'
//         }
//       }else{
//         return 'Nombre de Rol equivocado'
//       }
//     }
//   }


//   obtenerRecursosGrupoUser(nombreGrupo,userName){
//     resultSet = SELECT * FROM UsuarioGrupo WHERE nombreUser = userName AND nombreGrupo = nombreGrupo;
//     if(!resultSet.empty){ // Pertenece al Grupo
//       resultSetRecursos = SELECT nombreRecurso FROM Recurso WHERE grupo = nombreGrupo;
//       if(!resultSetRecursos.empty){
//         return resultSetRecursos.get("nombreRecurso") // Listado de 'nombreRecurso' que son Strings
//       }else{
//         return 'El Grupo ' + nombreGrupo + ' no tiene recursos'
//       }
//     }else{
//       return 'Usted no pertenece al Grupo'
//     }
//   }

//   subirArchivo(emailUser,nombreGrupo, archivo,nombreRecurso){
//     // Ver como es mandar un MEDIUMBLOB a la DB y como tomarlo desde la Web
//     resultSet = SELECT * FROM UsuarioGrupo WHERE nombreUser = emailUser, nombreGrupo = nombreGrupo , agregar = True;
//     if(!resultSet.empty){
//       Date fecha = Date.now() // ver en javascript
//       query = INSERT INTO Recurso(nombreRecurso, fecha.ToString , nombreGrupo , archivo)
//       resultadoInsert = conn.ejecutarQuery(query)
//       if(resultadoInsert exitoso){
//         return 'Archivo agregado satisfactoriamente'
//       }else{
//         return 'Ha ocurrido un problema'
//       }
//     }
//   }

module.exports = router;