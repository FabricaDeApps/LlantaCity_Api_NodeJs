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

module.exports = ruta