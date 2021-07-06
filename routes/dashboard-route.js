const express = require('express')
const router = express.Router()
const db = require('../database')
const bcrypt = require('bcrypt')
const constants = require('../utils/constants')
const utils = require('../utils/utils')
global.userGroupsList = []

router.get('/', function(req, res, next) {
    obtainUserGroups(req, res)
})

// router.post('/dashboard', function(req, res, next) {
//     if (req.session.loggedInUser) {
//         inputData = {
//             groupName: req.body.groupName,
//             emailAddressNewUser: req.body.emailAddressNewUser,
//             role: req.body.role
//         }
//         utils.addPersonToGroup(inputData.groupName, inputData.emailAddressNewUser, inputData.role)
//     }
// });

router.get('/group', function(req, res, next) {

    if (req.session.loggedInUser) {
        res.render('group-form', {groupName: req.body.action})
    } else {
        res.redirect('/user/login')
    }
});

// router.post('/group', function(req, res, next) {
//     if (req.session.loggedInUser) {
//         inputData = {
//             groupName: req.body.groupName,
//             emailAddressNewUser: req.body.emailAddressNewUser,
//             role: req.body.role
//         }
//         utils.addPersonToGroup(inputData.groupName, inputData.emailAddressNewUser, inputData.role)
//     }
// });

const obtainUserGroups = function(req, res) {
    if (req.session.loggedInUser) {
        SQL_STATEMENT = `SELECT nombreGrupo FROM ${process.env.DB_USUARIO_GRUPO_TABLE} WHERE nombreUser =?`;

        db.query(SQL_STATEMENT, [req.session.emailAddress], function(err, query_result, fields) {
            var numberOfGroups = 0
            if (query_result.length > 0) {
                numberOfGroups = query_result.length
                for (i = 0; i <= numberOfGroups - 1; i++) {
                    global.userGroupsList.push(query_result[i].nombreGrupo)
                }
            }
            res.render('dashboard-form', { email: req.session.emailAddress, groups: global.userGroupsList })
        })
    } else {
        res.redirect('/user/register')
    }
}


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