'use strict';
let headers = require('../public/headers');
const constantes = require('../public/constants');
const Tires = require('../models/tires.model');
const express = require('express')
const ruta = express.Router()
const axios = require('axios');
const excel = require('exceljs');
var dateFormat = require('dateformat');
const uploadFile = require("../public/uploadExcel");
const readXlsxFile = require('read-excel-file/node')

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
                                console.warn("Batch end page: " + i)
                                if (i == lastPage) {
                                    console.warn("Termino exitosamente el proceso")
                                    res.json(headers.getSuccessResponse(constantes.BATCH_PRODUCT, null));
                                }
                            }).catch((err) => {
                                return res.status(500).json(headers.getInternalErrorResponse(constantes.SERVER_ERROR, err));
                            });
                        }).catch((err) => {
                            return res.status(500).json(headers.getInternalErrorResponse(constantes.SERVER_ERROR, err));
                        });
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

ruta.get('/getExcelTires', async (req, res) => {
    //Get all categories
    await Tires.getAllTires().then(async tires => {
        let workbook = new excel.Workbook(); //creating workbook

        const jsonPre = JSON.parse(JSON.stringify(tires));
        let worksheet = workbook.addWorksheet(dateFormat(new Date(), "dd-mm-yyyy HH_MM")); //creating worksheet

        //  WorkSheet Header
        worksheet.columns = [
            { header: 'idTire', key: 'idTire', width: 20 },
            { header: 'keyLlantacity', key: 'keyLlantacity', width: 40 },
            { header: 'codigo', key: 'codigo', width: 40 },
            { header: 'categoria', key: 'categoria', width: 40 },
            { header: 'marca', key: 'marca', width: 40 },
            { header: 'ancho', key: 'ancho', width: 30 },
            { header: 'alto', key: 'alto', width: 30 },

            { header: 'rin', key: 'rin', width: 30 },
            { header: 'diseno', key: 'diseno', width: 40 },
            { header: 'clasZR', key: 'clasZR', width: 40 },
            { header: 'indiceCarga', key: 'indiceCarga', width: 40 },
            { header: 'indiceVel', key: 'indiceVel', width: 40 },
            { header: 'aplicacion', key: 'aplicacion', width: 50 },
            { header: 'charge', key: 'charge', width: 40 },
            { header: 'homologacion', key: 'homologacion', width: 40 },
            { header: 'costo', key: 'costo', width: 40 },
            { header: 'existencia', key: 'existencia', width: 30 },
            { header: 'image', key: 'image', width: 40 },
            { header: 'idProveedor', key: 'idProveedor', width: 30 },
            { header: 'pesoVolumetrico', key: 'pesoVolumetrico', width: 40 },
            { header: 'temperatura', key: 'temperatura', width: 40 },
            { header: 'traccion', key: 'traccion', width: 40 },
            { header: 'treadwear', key: 'treadwear', width: 40 },
            { header: 'estilo', key: 'estilo', width: 40 },
            { header: 'caracteristica', key: 'caracteristica', width: 40 },
            { header: 'tipoIdentificacion', key: 'tipoIdentificacion', width: 40 },
            { header: 'numeroIdentificacion', key: 'numeroIdentificacion', width: 40 },
            { header: 'garantiaAnos', key: 'garantiaAnos', width: 40 },
            { header: 'paisEnvio', key: 'paisEnvio', width: 40 },
            { header: 'tipoVehiculo', key: 'tipoVehiculo', width: 40 },
            { header: 'descripcionCorta', key: 'descripcionCorta', width: 50 },
            { header: 'diametroTotal', key: 'diametroTotal', width: 40 },
            { header: 'altoTotal', key: 'altoTotal', width: 40 }
        ];

        // Add Array Rows
        worksheet.addRows(jsonPre);
        worksheet.eachRow(function (row, rowNumber) {

            row.eachCell((cell, colNumber) => {
                if (rowNumber == 1) {
                    // First set the background of header row
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'B6AEAE' }
                    },
                        cell.font = {
                            bold: true,
                            size: 13,
                        },
                        cell.alignment = {
                            vertical: 'middle', horizontal: 'center'
                        };
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                }
            })
        })
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=' + 'LlantaCityMxReg-' + dateFormat(new Date(), "dd-mm-yyyy"), + '.xlsx');

        await workbook.xlsx.write(res);
        res.status(200).end();
    }).catch((err) => {
        return res.status(500).json(headers.getInternalErrorResponse(constantes.SERVER_ERROR, err));
    });
})

ruta.post('/importTires', async (req, res) => {
    uploadFile(req, res, function (err) {
        if (err) {
            if (err.code === 'filetype') {
                return res.send(headers.getBadErrorResponse(constantes.EXTENSION_NOT_MATCH))
            } else {
                return res.status(500).json(headers.getInternalErrorResponse(constantes.EXCEL_NOT_UPLOAD + req.file.originalname + "." + err));
            }
        } else {
            if (req.file == undefined) {
                return res.status(500).send(headers.getBadErrorResponse(constantes.NOT_EXCEL_FILES));
            }
            var pathExcel = req.file.path
            // File path.
            readXlsxFile(pathExcel).then((rows) => {
                // `rows` is an array of rows
                // each row being an array of cells.                
                rows.forEach(async function (row, i) {
                    if (i > 0) {
                        var params = {
                            idTire: row[0],
                            keyLlantacity: row[1],
                            codigo: row[2],
                            categoria: row[3] == null ? null : row[3].toUpperCase(),
                            marca: row[4] == null ? null : row[4].toUpperCase(),
                            ancho: row[5],
                            alto: row[6],
                            rin: row[7],
                            diseno: row[8] == null ? null : row[8].toUpperCase(),
                            clasZR: row[9],
                            indiceCarga: row[10],
                            indiceVel: row[11],
                            aplicacion: row[12] == null ? null : row[12].toUpperCase(),
                            charge: row[13],
                            homologacion: row[14],
                            costo: row[15],
                            existencia: row[16],
                            image: row[17],
                            idProveedor: row[18],
                            pesoVolumetrico: row[19],
                            temperatura: row[20],
                            traccion: row[21],
                            treadwear: row[22],
                            estilo: row[23],
                            caracteristica: row[24],
                            tipoIdentificacion: row[25],
                            numeroIdentificacion: row[26],
                            garantiaAnos: row[27],
                            paisEnvio: row[28],
                            tipoVehiculo: row[29],
                            descripcionCorta: row[30],
                            diametroTotal: row[31],
                            altoTotal: row[32]
                        }
                        params.idTire + "".trim()
                        if (params.idTire == "" || params.idTire == null || params.idTire == undefined) {
                            //Crear nuevo registro de llanta                            
                            delete params['idTire'];
                            params.keyLlantacity = params.marca.substring(0, 3) + params.ancho + params.alto + params.rin + getDisenoForKey(params.diseno) + params.indiceCarga + params.indiceVel + "-" + params.idProveedor
                            await Tires.getImageFromDiseno(params.diseno).then(async tireByDiseno => {
                                if(tireByDiseno.length > 0){
                                    params.image = tireByDiseno[0].image
                                } else{
                                    params.image = null
                                }
                                await Tires.addNewTires(params).then(create => {
                                    console.log("Registro creado con el idTire: ", create)
                                }).catch((err) => {
                                    console.warn("Ocurrio un error al insertar: ", err)
                                });
                            }).catch((err) => {
                                console.warn("Ocurrio un error al obtener la imagen: ", err)
                            });
                        } else {
                            //Actualizar registro de llanta                                                        
                            await Tires.updateTires(params).then(update => {
                                console.log("Registro actualizado por el idTire: ", params.idTire)
                            }).catch((err) => {
                                console.warn("Ocurrio un error al actualizar: ", err)
                            });
                        }
                    }
                    if(i == rows.length){
                        console.warn("Termina el proceso...")
                        res.json(headers.getSuccessResponse(constantes.TIRES_EXCEL_LOAD, null));
                    }
                })
            })
        }
    });
})

function getDisenoForKey(diseno) {
    var disenoConcat = ""
    var disenoSplit = diseno.split(" ")
    disenoSplit.forEach(dis => {
        disenoConcat += dis.substring(0, 2)
    })
    return disenoConcat
}
module.exports = ruta