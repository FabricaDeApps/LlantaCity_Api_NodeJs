'use strict';
let headers = require('../public/headers');
const constantes = require('../public/constants');
const Proveedor = require('../models/proveedores.model');
const express = require('express')
const ruta = express.Router()


ruta.get('/findById/:id', async (req, res) => {
    await Proveedor.getProveedorById(req.params.id).then(proveedor => {        
        res.json(headers.getSuccessResponse(constantes.MSG_GET, proveedor[0]));
    }).catch(err => {
        return res.status(500).json(headers.getInternalErrorResponse(constantes.SERVER_ERROR, err));
    })
})


ruta.get('/findAll', async (req, res) => {
    await Proveedor.getAllProveedoresActive().then(proveedores => {
        res.json(headers.getSuccessResponse(constantes.LIST_MSG, proveedores));
    }).catch(err => {
        return res.status(500).json(headers.getInternalErrorResponse(constantes.SERVER_ERROR, err));
    })
})

ruta.post('/add', async (req, res) => {
    let body = req.body
    await Proveedor.getProveedorByName(body.nombreComercial).then(async byName => {        
        if (byName.length > 0) {
            return res.send(headers.getBadErrorResponse(constantes.PROVEEDOR_DUPLICATE, null));
        }
        await Proveedor.addProveedor(body).then(proveedor => {
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
    await Proveedor.getProveedorById(body.idProveedor).then(async proveedor => {
        if (proveedor.length == 0) {
            return res.send(headers.getBadErrorResponse(constantes.PROVEEDOR_NOT_EXIST));
        }
        await Proveedor.updateProveedor(body).then(provU => {
            res.send(headers.getSuccessResponse(constantes.UPDATE_MSG, null));
        }).catch((err) => {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.send(headers.getBadErrorResponse(constantes.PROVEEDOR_DUPLICATE, err));
            } else {
                return res.status(500).send(headers.getInternalErrorResponse(constantes.SERVER_ERROR, err));
            }
        });
    }).catch((err) => {
        return res.status(500).send(headers.getInternalErrorResponse(constantes.SERVER_ERROR, err));
    });
})


ruta.post('/getAllPagination', async (req, res) => {
    let body = req.body
    await Proveedor.getAllProveedores(body).then(proveedores => {
        res.json(headers.getSuccessResponse(constantes.LIST_MSG, proveedores));
    }).catch(err => {
        return res.status(500).json(headers.getInternalErrorResponse(constantes.SERVER_ERROR, err));
    })
})

ruta.put('/changeStatus', async (req, res) => {
    let body = req.body
    await Proveedor.getProveedorById(body.idProveedor).then(async proveedor => {
        if (proveedor.length == 0) {
            return res.send(headers.getBadErrorResponse(constantes.PROVEEDOR_NOT_EXIST));
        }
        await Proveedor.changeStatus(body).then(provU => {
            res.send(headers.getSuccessResponse(constantes.CHANGE_STATUS, null));
        }).catch((err) => {
            return res.status(500).send(headers.getInternalErrorResponse(constantes.SERVER_ERROR, err));
        });
    }).catch((err) => {
        return res.status(500).send(headers.getInternalErrorResponse(constantes.SERVER_ERROR, err));
    });
})


module.exports = ruta