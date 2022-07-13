'use strict';
let headers = require('../public/headers');
const constantes = require('../public/constants');
const Admin = require('../models/admin.model');
const express = require('express')
const ruta = express.Router()
var dateFormat = require('dateformat');
var uuid = require('../public/generateUuid');
const bcrypt = require('bcrypt')

ruta.post('/add', async (req, res) => {
    let body = req.body
    body.hash_admin = uuid.generateUuid()
    body.password = bcrypt.hashSync(body.password, 10)
    await Admin.loginAdmin(body.email).then(async byEmail => {        
        if (byEmail.length > 0) {
            return res.send(headers.getBadErrorResponse(constantes.USER_DUPLICATE, null));
        }
        await Admin.addAdmin(body).then(admin => {
            res.send(headers.getSuccessResponse(constantes.SAVE_MSG, null));
        }).catch((err) => {
            return res.status(500).send(headers.getInternalErrorResponse(constantes.SERVER_ERROR, err));
        });
    }).catch((err) => {
        return res.status(500).send(headers.getInternalErrorResponse(constantes.SERVER_ERROR, err));
    });
})

ruta.put('/update', async (req, res) => {
    let body = req.body
    await Admin.findByHash(body.hash_admin).then(async admin => {
        if (admin.length == 0) {
            return res.send(headers.getBadErrorResponse(constantes.USER_NOT_EXIST));
        }
        await Admin.updateAdmin(body).then(adminU => {
            res.send(headers.getSuccessResponse(constantes.UPDATE_MSG, null));
        }).catch((err) => {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.send(headers.getBadErrorResponse(constantes.USER_DUPLICATE, err));
            } else {
                return res.status(500).send(headers.getInternalErrorResponse(constantes.SERVER_ERROR, err));
            }
        });
    }).catch((err) => {
        return res.status(500).send(headers.getInternalErrorResponse(constantes.SERVER_ERROR, err));
    });
})

ruta.post('/login', async (req, res) => {
    let body = req.body
    await Admin.loginAdmin(body.email).then(async user => {
        if (user.length == 0) {
            return res.send(headers.getBadErrorResponse(constantes.USER_NOT_GET));
        }
        const passwordValid = bcrypt.compareSync(body.password, user[0].password == null ? "" : user[0].password)
        if (!passwordValid) {
            return res.json(headers.getBadErrorResponse(constantes.USER_NOT_GET, null))
        }
        if (user[0].is_deleted || !user[0].active) {
            return res.json(headers.getBadErrorResponse(constantes.USER_NOT_ACTIVE, null))
        }
        delete user[0].password;
        res.send(headers.getSuccessResponse(constantes.USER_LOGIN, user[0]));
    }).catch((err) => {
        return res.status(500).send(headers.getInternalErrorResponse(constantes.SERVER_ERROR, err));
    });
})

ruta.delete('/delete/:hash_admin', async (req, res) => {
    await Admin.findByHash(req.params.hash_admin).then(async admin => {
        if (admin.length == 0) {
            return res.send(headers.getBadErrorResponse(constantes.USER_NOT_EXIST));
        }
        await Admin.deleteAdmin(req.params.hash_admin).then(adminD => {
            res.send(headers.getSuccessResponse(constantes.DELETE_MSG, null));
        }).catch((err) => {
            return res.status(500).send(headers.getInternalErrorResponse(constantes.SERVER_ERROR, err));
        });
    }).catch((err) => {
        return res.status(500).send(headers.getInternalErrorResponse(constantes.SERVER_ERROR, err));
    });
})

ruta.get('/findByHash/:hash_admin', async (req, res) => {
    await Admin.findByHash(req.params.hash_admin).then(usuario => {
        if(usuario.length > 0){
            delete usuario[0].password;
        }
        res.json(headers.getSuccessResponse(constantes.MSG_GET, usuario));
    }).catch(err => {
        return res.status(500).json(headers.getInternalErrorResponse(constantes.SERVER_ERROR, err));
    })
})


ruta.put('/changePassword', async (req, res) => {
    let body = req.body
    await Admin.findByHash(body.hash_admin).then(async usuario => {
        if (usuario.length == 0) {
            return res.send(headers.getBadErrorResponse(constantes.USER_NOT_EXIST));
        }
        body.new_password = bcrypt.hashSync(body.new_password, 10)
        await Admin.changePassword(body).then(user => {
            res.send(headers.getSuccessResponse(constantes.USER_PASSWORD, null));
        }).catch(err => {
            return res.status(500).json(headers.getInternalErrorResponse(constantes.SERVER_ERROR, err));
        });
    }).catch(err => {
        return res.status(500).json(headers.getInternalErrorResponse(constantes.SERVER_ERROR, err));
    })
})

ruta.post('/getAll', async (req, res) => {
    let body = req.body
    await Admin.getAllAdmins(body).then(usuarios => {
        res.json(headers.getSuccessResponse(constantes.LIST_MSG, usuarios));
    }).catch(err => {
        return res.status(500).json(headers.getInternalErrorResponse(constantes.SERVER_ERROR, err));
    })
})

ruta.put('/changeStatus', async (req, res) => {
    let body = req.body
    await Admin.findByHash(body.hash_admin).then(async admin => {
        if (admin.length == 0) {
            return res.send(headers.getBadErrorResponse(constantes.USER_NOT_EXIST));
        }
        await Admin.changeStatus(body).then(adminU => {
            res.send(headers.getSuccessResponse(constantes.CHANGE_STATUS, null));
        }).catch((err) => {
            return res.status(500).send(headers.getInternalErrorResponse(constantes.SERVER_ERROR, err));
        });
    }).catch((err) => {
        return res.status(500).send(headers.getInternalErrorResponse(constantes.SERVER_ERROR, err));
    });
})

module.exports = ruta