const express = require('express')
const router = express.Router()
const db = require('../database')
const bcrypt = require('bcrypt')
const constants = require('../utils/constants')


/* GET dashboard form */
router.get('/dashboard', function(req, res, next) {
    console.log(req.session.loggedInUser);
    if (req.session.loggedInUser) {
        //res.render('dashboard-form', { email: req.session.emailAddress })
        userGroupsList = obtenerGruposDeUsuario(req.session.emailAddress)
        res.render('dashboard-form', { email: req.session.emailAddress, groups: userGroupsList })
    } else {
        res.redirect('/user/register')
    }
});

router.post('/dashboard', function(req, res, next) {
    if (req.session.loggedInUser) {
        // userGroupsList = obtenerGruposDeUsuario(req.session.loggedInUser)
        res.render('dashboard-form', { email: req.session.emailAddress })

    }
});

function obtenerGruposDeUsuario(emailAddress) {
    SQL_STATEMENT = `SELECT nombreGrupo FROM ${process.env.DB_USUARIO_GRUPO_TABLE} WHERE nombreUser =?`;

    db.query(SQL_STATEMENT, [emailAddress], function(err, query_result, fields) {
        var numberOfGroups = 0
        var userGroupsList = []
        if (query_result.length > 0) {
            numberOfGroups = query_result.length
            for (i = 0; i <= numberOfGroups - 1; i++) {
                userGroupsList.push(query_result[i].nombreGrupo)
            }
        }
        return userGroupsList
    })

}

// function obtenerRecursosGrupoUser(nombreGrupo, nombreUser) {

// }

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