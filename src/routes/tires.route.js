'use strict';
let headers = require('../public/headers');
const constantes = require('../public/constants');
const Tires = require('../models/tires.model');
const express = require('express')
const ruta = express.Router()
var async = require('async');
const axios = require('axios');

ruta.post('/insertDataInWooCommerce', (req, res) => {
    var batchProductListCreate = []
    var batchProductListUpdate = []
    //Get all categories
    getAllCategories().then(async categorias => {
        //GET ALL TAGS
        await getAllTags().then(async tags => {
            //GET FIRST TIRES
            await Tires.getAllTiresPagination({ page: 1, limit: 9 }).then(async firtsTires => {
                // ITERATE FIRSTS TIRES
                for (var i = 0; i < firtsTires.tires.length; i++) {
                    var transformData = await transformJson(firtsTires.tires[i], categorias.data, tags.data)
                    if (transformData.id_woocommerce == null) {
                        batchProductListCreate.push(transformData)
                    } else {
                        batchProductListUpdate.push(transformData)
                    }
                }
                //UPDATE BATCH PRODUCTS
                await batchProducts(batchProductListCreate, batchProductListUpdate).then(async batchData => {
                    var dataResponse = batchData.data
                    //Itero los productos creados e inserto el id de woocommerce en mysql
                    if (dataResponse.create != undefined) {
                        for (var c = 0; c < dataResponse.create.length; c++) {
                            if (dataResponse.create[c].error == undefined) {
                                var arrayKey = dataResponse.create[c].sku.split("-");
                                var params = {
                                    id_woocommerce: dataResponse.create[c].id,
                                    keyLlantacity: arrayKey[1] + "-" + arrayKey[2],
                                    idTire: arrayKey[0]
                                }
                                await Tires.updateInCreate(params).then(idsProduct => {
                                    console.warn("Se actualizaron los ids de woocommerce")
                                }).catch((err) => {
                                    return res.status(500).json(headers.getInternalErrorResponse(constantes.SERVER_ERROR, err));
                                });
                            }
                        }
                    }
                    
                    //Itero los productos actualizados e inserto el el lastupdate en mysql
                    if (dataResponse.update != undefined) {
                        for (var u = 0; u < dataResponse.update.length; u++) {
                            if (dataResponse.update[u].error == undefined) {                                
                                var params = {
                                    id_woocommerce: dataResponse.update[u].id,                                    
                                }
                                await Tires.updateInUpdateWoocommerce(params).then(lastUpdateProduct => {
                                    console.warn("Se actualizaron las fechas de actualizacion en woocommerce")
                                }).catch((err) => {
                                    return res.status(500).json(headers.getInternalErrorResponse(constantes.SERVER_ERROR, err));
                                });
                            }
                        }
                    }
                    res.json(headers.getSuccessResponse(constantes.BATCH_PRODUCT, null));
                }).catch((err) => {
                    return res.status(500).json(headers.getInternalErrorResponse(constantes.SERVER_ERROR, err));
                });
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
    var category = categorias.find(categoryD => categoryD.name.toLowerCase() == categoryMysql.toLowerCase())
    if (category) {
        return category.id
    } else {
        return null
    }
}

function matchTag(tags, tagMysql) {
    var tag = tags.find(tagD => tagD.name.toLowerCase() == tagMysql.toLowerCase())
    if (tag) {
        return tag.id
    } else {
        return null
    }
}

function changeHomologacion(prodHomologacion) {
    var homologacion = '';
    if (prodHomologacion == null || prodHomologacion == "NULL") {
        homologacion = "";
    } else {
        homologacion = prodHomologacion + " ";
    }
    return homologacion;
}

async function transformJson(tireElement, categorias, tags) {
    return await new Promise((resolve, reject) => {
        var labelProduct = tireElement.ancho + '/' + tireElement.alto + 'R' + tireElement.rin + ' ' + tireElement.indiceCarga + tireElement.indiceVel + changeHomologacion(tireElement.homologacion) + " " + isRunflat(tireElement.aplicacion) + "<br><strong>" + tireElement.diseno + "</strong>";
        resolve({
            "id_woocommerce": tireElement.id_woocommerce,
            "id": tireElement.id_woocommerce,
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
                    //"src": constantes.URL_IMAGE_WOOCOMERCE + tireElement.image
                    "src": 'https://extyseg.com/wp-content/uploads/2019/04/EXTYSEG-imagen-no-disponible.jpg'
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

async function batchProducts(batchProductListCreate, batchProductListUpdate) {
    var data = JSON.stringify({
        "create": batchProductListCreate,
        "update": batchProductListUpdate
    })
    const config = {
        method: 'post',
        url: constantes.URL_WOOCOMMERCE + 'wp-json/wc/v3/products/batch?consumer_key=' + constantes.consumer_key + '&consumer_secret=' + constantes.consumer_secret,
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };
    return await new Promise((resolve, reject) => {
        axios(config).then((batchProducts) => {
            resolve(batchProducts)
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