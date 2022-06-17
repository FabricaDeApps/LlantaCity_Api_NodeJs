'use strict';
let headers = require('../public/headers');
const constantes = require('../public/constants');
const Tires = require('../models/tires.model');
const express = require('express')
const ruta = express.Router()
var async = require('async');
const axios = require('axios');

ruta.post('/insertDataInWooCommerce', (req, res) => {
    Tires.getAllTiresPagination({ page: 1, limit: 100 }).then(async firtsTires => {
        //Get first page        
        res.json(headers.getSuccessResponse(constantes.SAVE_MSG, firtsTires));
    }).catch((err) => {
        return res.status(500).json(headers.getInternalErrorResponse(constantes.SERVER_ERROR, err));
    });
})

async function getNextPages(page, tokenPulpo) {
    return await new Promise((resolve, reject) => {
        axios.get(constantes.URL_PULPO + 'service/api/v1/vehicles?page=' + page + '&size=500&sort=name', {
            headers: {
                'Authorization': 'Bearer ' + tokenPulpo
            }
        }).then((allPages) => {
            resolve(allPages.data.data)
        }).catch((err) => {
            reject(err)
        });
    });
}

async function transformJson(tireElement) {
    return await new Promise((resolve, reject) => {
        axios.get(constantes.URL_PULPO + 'service/api/v1/vehicles?page=' + page + '&size=500&sort=name', {
            headers: {
                'Authorization': 'Bearer ' + tokenPulpo
            }
        }).then((allPages) => {
            resolve(allPages.data.data)
        }).catch((err) => {
            reject(err)
        });
    });
}


module.exports = ruta