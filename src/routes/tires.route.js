'use strict';
let headers = require('../public/headers');
const constantes = require('../public/constants');
const Tires = require('../models/tires.model');
const express = require('express')
const ruta = express.Router()


ruta.post('/getTires', (req, res) => {
    let body = req.body    
    Tires.getAllTires(body).then(places => {
        res.json(headers.getSuccessResponse(constantes.LIST_MSG, places));
    }).catch(err => {
        return res.status(500).json(headers.getInternalErrorResponse(constantes.SERVER_ERROR, err));
    })
})


module.exports = ruta