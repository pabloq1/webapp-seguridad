const express = require('express')
const router = express.Router()
const db = require('../database')
const bcrypt = require('bcrypt')
const constants = require('../utils/constants')
const utils = require('../utils/utils');
const { query } = require('../database')
const { Router } = require('express')


router.get('/', function(req, res, next) {
    obtainUserGroups(req, res)
})

router.get('/group', function(req, res, next) {
    if (req.session.loggedInUser) {
        res.render('group-form', { groupName: req.body.action })
    } else {
        res.redirect('/user/login')
    }
});

router.post('/group', function(req, res, next) {
     if (req.session.loggedInUser) {
        req.session.groupName = req.body.group_name
        console.log(`EL GROUP NAME SESSION ES ${ req.session.groupName } `)
        obtenerPermisosGrupoUser(req, res, req.body.group_name)
   }
});

router.post('/group/confirmation', function(req, res, next) {
    if (req.session.loggedInUser) {
        addPersonToGroup(req, res, req.session.emailAddress, req.session.groupName, req.body.email_address, req.body.option)
    }
});

/* ------------------------------------------------------------------ */

const obtainUserGroups = function(req, res) {
    if (req.session.loggedInUser) {
        SQL_STATEMENT = `SELECT nombreGrupo FROM ${ process.env.DB_USUARIO_GRUPO_TABLE } WHERE nombreUser =?`;
        var userGroupsList = []
        db.query(SQL_STATEMENT, [req.session.emailAddress], function(err, query_result, fields) {
            if (err) throw err
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
        SQL_STATEMENT = `SELECT * FROM ${ process.env.DB_USUARIO_GRUPO_TABLE } WHERE nombreUser =? AND nombreGrupo =?`;
        var permisos;
        db.query(SQL_STATEMENT, [req.session.emailAddress, groupName], function(err, query_result, fields) {
            if (err) throw err
            if (query_result.length > 0) {
                permisos = {
                    "agrega": query_result[0].agrega,
                    "lee": query_result[0].lee,
                    "escribe": query_result[0].escribe
                }  
                SQL_STATEMENT_RECURSOS = `SELECT nombreRecurso FROM ${ process.env.DB_RECURSO_TABLE } WHERE grupo = ?`;
                db.query(SQL_STATEMENT_RECURSOS, [groupName], function(err,query_result,fields){
                    if (err) throw err
                    var nombresRecursos = []
                    console.log(query_result)
                    if(query_result.length > 0){
                        for (var i = 0; i < query_result.length; i++) {
                            var elem = query_result[i]
                            nombresRecursos.push(elem.nombreRecurso)
                        }                        
                        console.log(constants.HAS_RESOURCES)
                        
                        res.render('group-form', { email: req.session.emailAddress, permisos: permisos, groupname: groupName, recursos: nombresRecursos })
                    } else {
                        res.render('group-form', { email: req.session.emailAddress, permisos: permisos, groupname: groupName, recursos: nombresRecursos })
                    }
                })
            }
        })
    } else {
        res.redirect('/user/register')
    }
}

function isEmpty(obj) {
    return !Object.keys(obj).length > 0;
  }

const addPersonToGroup = function(req, res, emailAddress, groupName, emailAddressNewUser, role) {
    SQL_CHECK_ADMIN = `SELECT * FROM ${ process.env.DB_USUARIO_GRUPO_TABLE } WHERE nombreUser =? AND nombreGrupo =? AND agrega =?`
    SQL_ADD_NEW_MEMBER = ""
    newMemberInput = {
            nombreUser: emailAddressNewUser,
            nombreGrupo: groupName,
            agrega: false,
            escribe: true,
            lee: true
        }
        // chequeo si soy el admin del grupo
    db.query(SQL_CHECK_ADMIN, [emailAddress, groupName, true], function(err, query_result, fields) {
        if (err) throw err
        if (query_result.length > 0) {
            // tengo permiso de agregar
            switch (role) {
                case constants.MEMBER:
                    SQL_ADD_NEW_MEMBER = `INSERT INTO ${ process.env.DB_USUARIO_GRUPO_TABLE } SET ?`
                    addMember(req, res, SQL_ADD_NEW_MEMBER, newMemberInput)
                    break;
                case constants.ADMIN:
                    newMemberInput.agrega = true
                    SQL_ADD_NEW_MEMBER = `INSERT INTO ${ process.env.DB_USUARIO_GRUPO_TABLE } SET ?`
                    addMember(req, res, SQL_ADD_NEW_MEMBER, newMemberInput)
                    break;
                default:
                    console.log("NO MEMBER")
            }
        }
    })
};

const addMember = function(req, res, query, input) {
    var SQL_CHECK_EXISTING_ROLE =  `SELECT * FROM ${process.env.DB_USUARIO_GRUPO_TABLE} WHERE nombreUser =? AND nombreGrupo =?`
    db.query(SQL_CHECK_EXISTING_ROLE, [input.nombreUser, input.nombreGrupo], function(err, query_result) {
        if (err) throw err
        if (query_result.length > 0) {
            res.render('confirmation-form', {msg: `La persona ${ req.session.emailAddress } ya se encuentra asignada al grupo ${input.nombreGrupo}`, email: req.session.emailAddress })
        } else {
            db.query(query, [input], function(err, query_result) {
                if (err) throw err
                res.render('confirmation-form', {msg: `El usuario ${ req.session.emailAddress } ha sido agregado al grupo ${input.nombreGrupo} con éxito.`, email: req.session.emailAddress})
            })
        }
    })
};


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