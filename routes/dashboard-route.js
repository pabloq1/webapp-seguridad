const express = require('express')
const router = express.Router()
const db = require('../database')
const constants = require('../utils/constants')
const { query } = require('../database')
const { Router } = require('express')
const NodeRSA = require('node-rsa');
const key = new NodeRSA({ b: 1024 });

const key_private = new NodeRSA(process.env.PRIVATE_KEY)

router.get('/', function(req, res, next) {
    obtainUserGroups(req, res)
})

router.get('/group/write', function(req, res, next) {
    if (req.session.loggedInUser) {
        obtainUserGroups(req, res)
    } else {
        res.redirect('/user/login')
    }
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
        obtenerPermisosGrupoUser(req, res, req.body.group_name)
   } else {
        res.redirect('/user/register')
    }
});

router.post('/group/confirmation', function(req, res, next) {
    if (req.session.loggedInUser) {
        addPersonToGroup(req, res, req.session.emailAddress, req.session.groupName, req.body.email_address, req.body.option)
    } else {
        res.redirect('/user/register')
    }
});

router.post('/group/write', function(req, res, next) {
    if (req.session.loggedInUser) {
        var SQL_PUBLIC_KEY = `SELECT clavePub FROM ${ process.env.DB_USUARIO_TABLE } WHERE email =?`;
        db.query(SQL_PUBLIC_KEY, [req.session.emailAddress], function(err, query_result, fields) {
            if (err) throw err
            if (query_result.length > 0) {
                const key_public = new NodeRSA(query_result[0].clavePub)
                inputRecurso = {
                    nombre: req.body.nombre,
                    contenido: key_public.encrypt(req.body.contenido, 'base64'),
                    grupo: req.session.groupName
                }
                uploadFile(req, res, inputRecurso)
            }
        })
    } else {
        res.redirect('/user/register')
    }
  });


/* ------------------------------------------------------------------ */

const uploadFile = function(req, res, recurso){
    if (req.session.loggedInUser) {
        SQL_STATEMENT = `SELECT * FROM ${ process.env.DB_USUARIO_GRUPO_TABLE } WHERE nombreUser =? AND nombreGrupo =? AND agrega =?`;
        db.query(SQL_STATEMENT, [req.session.emailAddress, req.session.groupName, true], function(err, query_result, fields) {
            if (err) throw err
            if (query_result.length > 0) {
                SQL_STATEMENT_RECURSO = `INSERT INTO ${ process.env.DB_RECURSO_TABLE } SET ?`; 
                db.query(SQL_STATEMENT_RECURSO, [recurso], function(err, query_result, fields){
                    if (err) throw err
                    res.render('confirmation-form', {msg: `Se subió el archivo ${recurso.nombre} con éxito`, email: req.session.emailAddress})
               })     
            } else{
                res.render('confirmation-form', {msg: `No se pudo subir el archivo`, email: req.session.emailAddress})
            }
        })
    } else {
        res.redirect('/user/register')
    }
}

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
                SQL_STATEMENT_RECURSOS = `SELECT * FROM ${ process.env.DB_RECURSO_TABLE } WHERE grupo = ?`;
                db.query(SQL_STATEMENT_RECURSOS, [groupName], function(err, query_result, fields){
                    if (err) throw err
                    var nombresRecursos = []
                    var contenidos = []
                    if(query_result.length > 0){
                        for (var i = 0; i < query_result.length; i++) {
                            var elem = query_result[i]
                            nombresRecursos.push(elem.nombre)
                            contenidos.push(elem.contenido)
                        }                        

                        for (var i = 0; i < contenidos.length; i++) {
                            var desencriptado = key_private.decrypt(contenidos[i], 'utf8')
                            contenidos[i] = desencriptado
                        }
                        res.render('group-form', { email: req.session.emailAddress, permisos: permisos, groupname: groupName, recursos: contenidos })
                    } else {
                        res.render('group-form', { email: req.session.emailAddress, permisos: permisos, groupname: groupName, recursos: contenidos })
                    }
                })
            }
        })
    } else {
        res.redirect('/user/register')
    }
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
            res.render('confirmation-form', {msg: `La persona ${ input.nombreUser } ya se encuentra asignada al grupo ${input.nombreGrupo}`, email: input.nombreUser })
        } else {
            db.query(query, [input], function(err, query_result) {
                if (err) throw err
                res.render('confirmation-form', {msg: `El usuario ${ input.nombreUser } ha sido agregado al grupo ${input.nombreGrupo} con éxito.`, email: input.nombreUser})
            })
        }
    })
};



module.exports = router;