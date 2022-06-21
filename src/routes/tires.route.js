'use strict';
let headers = require('../public/headers');
const constantes = require('../public/constants');
const Tires = require('../models/tires.model');
const express = require('express')
const ruta = express.Router()
var async = require('async');
const axios = require('axios');

ruta.post('/insertDataInWooCommerce', (req, res) => {
    var batchProductList = []
    //Get all categories
    getAllCategories().then(async categorias => {
        //GET ALL TAGS
        getAllTags().then(async tags => {
            //GET FIRST TIRES
            Tires.getAllTiresPagination({ page: 1, limit: 10 }).then(async firtsTires => {
                for (var i = 0; i < firtsTires; i++) {
                    batchProductList.push(transformJson(i, categorias, tags))
                }
                res.json(headers.getSuccessResponse(constantes.SAVE_MSG, batchProductList));
            }).catch((err) => {
                return res.status(500).json(headers.getInternalErrorResponse(constantes.SERVER_ERROR, err));
            });
        }).catch((err) => {
            return res.status(500).json(headers.getInternalErrorResponse(constantes.SERVER_ERROR, err));
        });
    }).catch((err) => {
        return res.status(500).json(headers.getInternalErrorResponse(constantes.SERVER_ERROR, err));
    });
})

function matchCategory(categorias, categoryMysql) {
    var category = categorias.filter(categoryD => categoryD.name.toLowerCase() == categoryMysql.toLowerCase())
    if (category) {
        return category.id
    } else {
        return null
    }
}

function matchTag(tags, tagMysql) {
    var tag = tags.filter(tagD => tagD.name.toLowerCase() == tagMysql.toLowerCase())
    if (category) {
        return tag.id
    } else {
        return null
    }
}

function changeHomologacion(homologacion) {
    var homologacion = '';
    if (homologacion == null) {
        homologacion = "";
    } else {
        homologacion = homologacion + " ";
    }
    return homologacion;
}

async function transformJson(tireElement, categorias, tags) {
    console.warn(tireElement)
    return await new Promise((resolve, reject) => {
        var labelProduct = tireElement.ancho + '/' + tireElement.alto + 'R' + tireElement.rin + ' ' + tireElement.indiceCarga + tireElement.indiceVel + changeHomologacion(tireElement.homologacion) + " " + isRunflat(tireElement.aplicacion) + "<br><strong>" + tireElement.diseno + "</strong>";
        resolve({
            "name": labelProduct,
            "sku": tireElement.idTire + "-" + tireElement.keyLlantacity,
            "stock_quantity": tireElement.existencia,
            "manage_stock": true,
            "regular_price": tireElement.costo,
            "description": labelProduct,
            "tags": [
                {
                    "id": matchTag(tags, tireElement.categoria)
                }
            ],
            "categories": [
                {
                    "id": matchCategory(categorias, tireElement.marca)
                }
            ],
            "images": [
                {
                    "src": constantes.URL_IMAGE_WOOCOMERCE + tireElement.image
                }
            ]
        })
    });
}

function isRunflat(aplicacion) {
    let result = aplicacion.toLowerCase().includes("runflat");
    if (result) {
        return "Runflat";
    } else {
        return "";
    }
}

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

async function getAllCategories() {
    return await new Promise((resolve, reject) => {
        axios.get(constantes.URL_WOOCOMMERCE + 'wp-json/wc/v3/products/categories?consumer_key=' + constantes.consumer_key + '&consumer_secret=' + constantes.consumer_secret, {
        }).then((allCategories) => {
            resolve(allCategories)
        }).catch((err) => {
            reject(err)
        });
    });
}

async function getAllTags() {
    return await new Promise((resolve, reject) => {
        axios.get(constantes.URL_WOOCOMMERCE + 'wp-json/wc/v3/products/tags?consumer_key=' + constantes.consumer_key + '&consumer_secret=' + constantes.consumer_secret, {
        }).then((allTags) => {
            resolve(allTags)
        }).catch((err) => {
            reject(err)
        });
    });
}

module.exports = ruta