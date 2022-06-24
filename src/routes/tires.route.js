'use strict';
let headers = require('../public/headers');
const constantes = require('../public/constants');
const Tires = require('../models/tires.model');
const express = require('express')
const ruta = express.Router()
const axios = require('axios');

ruta.post('/insertDataInWooCommerce', async (req, res) => {
    //Get all categories
    await getAllCategories().then(async categorias => {
        //GET ALL TAGS
        await getAllTags().then(async tags => {
            //GET FIRST TIRES
            await Tires.getAllTiresPagination({ page: 1, limit: 100 }).then(async firstTires => {
                var lastPage = firstTires.pagination.last_page
                //Bath first elements
                await iterateArrayForBatch(firstTires.tires, categorias.data, tags.data, 1).then(async responseT => {
                    for (var i = 2; i <= lastPage; i++) {
                        //Batch next all pages
                        await Tires.getAllTiresPagination({ page: i, limit: 100 }).then(async allTires => {
                            await iterateArrayForBatch(allTires.tires, categorias.data, tags.data, i).then(async responseTransform => {

                            }).catch((err) => {
                                return res.status(500).json(headers.getInternalErrorResponse(constantes.SERVER_ERROR, err));
                            });
                        }).catch((err) => {
                            return res.status(500).json(headers.getInternalErrorResponse(constantes.SERVER_ERROR, err));
                        });
                        if (i == lastPage) {
                            console.warn("Termino exitosamente el proceso")
                            res.json(headers.getSuccessResponse(constantes.BATCH_PRODUCT, null));
                        }
                    }
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

async function iterateArrayForBatch(tires, categorias, tags, pagina) {
    var batchProductListCreate = []
    var batchProductListUpdate = []
    return await new Promise(async (resolve, reject) => {
        // TRANSFORM TIRES
        for (var i = 0; i < tires.length; i++) {
            var transformData = await transformJson(tires[i], categorias, tags)
            if (transformData.id_woocommerce == null) {
                batchProductListCreate.push(transformData)
            } else {
                batchProductListUpdate.push(transformData)
            }
        }

        //BATCH PRODUCTS
        await batchProducts(batchProductListCreate, batchProductListUpdate).then(async batchData => {
            var dataResponse = batchData.data
            //Itero los productos creados e inserto el id de woocommerce en mysql
            if (dataResponse.create != undefined) {
                for (var c = 0; c < dataResponse.create.length; c++) {
                    if (dataResponse.create[c].error == undefined) {
                        var arrayKey = dataResponse.create[c].sku.split("-");
                        var params = {
                            id_woocommerce: dataResponse.create[c].id,
                            idTire: arrayKey[0]
                        }
                        await Tires.updateInCreate(params).then(idsProduct => {
                            console.warn("(CREATE) Se actualizo en MySql el idWoocomerce: " + params.id_woocommerce + " pagina: " + pagina)
                        }).catch((err) => {
                            reject(constantes.SERVER_ERROR, err)
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
                            console.warn("(UPDATE) Se actualizo la fecha en MySql el idWoocomerce: " + params.id_woocommerce + " pagina: " + pagina)
                        }).catch((err) => {
                            reject(constantes.SERVER_ERROR, err)
                        });
                    }
                }
            }
            resolve(constantes.BATCH_PRODUCT)
        }).catch((err) => {
            reject(constantes.SERVER_ERROR, err)
        });
    });
}

function matchCategory(categorias, categoryMysql) {
    if (categoryMysql == null || categoryMysql == undefined) {
        return null;
    } else {
        var category = categorias.find(categoryD => categoryD.name.toLowerCase() == categoryMysql.toLowerCase())
        if (category) {
            return category.id
        } else {
            return null
        }
    }
}

function matchTag(tags, tagMysql) {
    if (tagMysql == null || tagMysql == undefined) {
        return null;
    } else {
        var tag = tags.find(tagD => tagD.name.toLowerCase() == tagMysql.toLowerCase())
        if (tag) {
            return tag.id
        } else {
            return null
        }
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
        var image = ""
        if (tireElement.image == null || tireElement == undefined || tireElement.image == "") {
            image = "https://extyseg.com/wp-content/uploads/2019/04/EXTYSEG-imagen-no-disponible.jpg"
        } else {
            var splitImage = tireElement.image.split('.')
            image = constantes.URL_IMAGE_WOOCOMERCE + splitImage[0] + '.jpeg'
        }
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
                    "src": image
                    //"src": 'https://extyseg.com/wp-content/uploads/2019/04/EXTYSEG-imagen-no-disponible.jpg'
                }
            ],
            "attributes": [
                {
                    "id": 2,
                    "position": 0,
                    "options": tireElement.alto,
                    "visible": true,
                    "variation": true
                },
                {
                    "id": 1,
                    "position": 0,
                    "options": tireElement.ancho,
                    "visible": true,
                    "variation": true
                },
                {
                    "id": 3,
                    "position": 0,
                    "options": tireElement.rin,
                    "visible": true,
                    "variation": true
                },
                {
                    "id": 4,
                    "position": 0,
                    "options": tireElement.indiceCarga,
                    "visible": true,
                    "variation": true
                },
                {
                    "id": 5,
                    "position": 0,
                    "options": tireElement.indiceVel,
                    "visible": true,
                    "variation": true
                },
                {
                    "id": 6,
                    "position": 0,
                    "options": tireElement.aplicacion,
                    "visible": true,
                    "variation": true
                }
            ]
        })
    });
}

function isRunflat(aplicacion) {
    if (aplicacion == null || aplicacion == undefined) {
        return null;
    } else {
        let result = aplicacion.toLowerCase().includes("runflat");
        if (result) {
            return "Runflat";
        } else {
            return "";
        }
    }
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
        axios.get(constantes.URL_WOOCOMMERCE + 'wp-json/wc/v3/products/categories?consumer_key=' + constantes.consumer_key + '&consumer_secret=' + constantes.consumer_secret + "&per_page=" + constantes.PER_PAGE, {
        }).then((allCategories) => {
            resolve(allCategories)
        }).catch((err) => {
            reject(err)
        });
    });
}

async function getAllTags() {
    return await new Promise((resolve, reject) => {
        axios.get(constantes.URL_WOOCOMMERCE + 'wp-json/wc/v3/products/tags?consumer_key=' + constantes.consumer_key + '&consumer_secret=' + constantes.consumer_secret + "&per_page=" + constantes.PER_PAGE, {
        }).then((allTags) => {
            resolve(allTags)
        }).catch((err) => {
            reject(err)
        });
    });
}

module.exports = ruta