'use strict';
var dbConn = require('../../database/db.config');

exports.getAllTires = async function () {
    return await new Promise((resolve, reject) => {
        dbConn.query("Select * from t_tires", function (err, result) {
            if (err) {
                return reject(err);
            } else {
                return resolve(result);
            }
        });
    });
}

exports.getImageFromDiseno = async function (diseno) {
    return await new Promise((resolve, reject) => {
        dbConn.query("SELECT *  FROM t_tires WHERE diseno LIKE ? LIMIT 0,1", diseno, function (err, result) {
            if (err) {
                return reject(err);
            } else {
                return resolve(result);
            }
        });
    });
}

exports.getAllTiresPagination = async function (request) {
    return await new Promise((resolve, reject) => {
        const limit = request.limit
        // page number
        const page = request.page
        // calculate offset
        const offset = (page - 1) * limit
        dbConn.query("Select * from t_tires where isDeleted = 0 LIMIT " + limit + " OFFSET " + offset, function (err, result) {
            if (err) {
                return reject(err);
            } else {
                dbConn.query("SELECT COUNT(*) AS cantidad FROM t_tires where isDeleted = 0", function (err, quantity) {
                    if (err) {
                        return reject(err);
                    } else {
                        var jsonResult = {
                            'total': quantity[0].cantidad,
                            'per_page': limit,
                            'current_page': page,
                            'last_page': Number.isInteger(quantity[0].cantidad / limit) ? Math.round(quantity[0].cantidad / limit) : Math.round(quantity[0].cantidad / limit) + 1
                        }
                        return resolve({ pagination: jsonResult, tires: result });
                    }
                });
            }
        });
    });
}

//From woocomerce response
exports.updateInCreate = async function (body) {
    return await new Promise((resolve, reject) => {
        dbConn.query("UPDATE t_tires SET id_woocommerce=?, last_update_woocommerce=? WHERE idTire = ?", [body.id_woocommerce, new Date(), body.idTire], function (err, result) {
            if (err) {
                return reject(err);
            } else {
                return resolve(result);
            }
        });
    });
}

//From woocomerce response
exports.updateInUpdateWoocommerce = async function (body) {
    return await new Promise((resolve, reject) => {
        dbConn.query("UPDATE t_tires SET last_update_woocommerce=? WHERE id_woocommerce = ?", [new Date(), body.id_woocommerce], function (err, result) {
            if (err) {
                return reject(err);
            } else {
                return resolve(result);
            }
        });
    });
}

//Update tires
exports.updateTires = async function (body) {
    return await new Promise((resolve, reject) => {
        dbConn.query("UPDATE t_tires SET codigo=?, categoria=?, marca=?, ancho=?, alto=?, rin=?, diseno=?, clasZR=?, indiceCarga=?, indiceVel=?, aplicacion=?, charge=?, homologacion=?, costo=?, existencia=?, image=?, createdTime=?, idProveedor=?, pesoVolumetrico=?, temperatura=?, traccion=?, treadwear=?, estilo=?, caracteristica=?, tipoIdentificacion=?, numeroIdentificacion=?, garantiaAnos=?, paisEnvio=?, tipoVehiculo=?, descripcionCorta=?, diametroTotal=?, altoTotal=? WHERE idTire = ?", 
        [body.codigo, body.categoria, body.marca, body.ancho, body.alto, body.rin, body.diseno, body.clasZR, body.indiceCarga, body.indiceVel, body.aplicacion, body.charge, body.homologacion, body.costo, body.existencia, body.image, new Date(), body.idProveedor, body.pesoVolumetrico, body.temperatura, body.traccion, body.treadwear, body.estilo, body.caracteristica, body.tipoIdentificacion, body.numeroIdentificacion, body.garantiaAnos, body.paisEnvio, body.tipoVehiculo, body.descripcionCorta, body.diametroTotal, body.altoTotal, body.idTire], function (err, result) {
            if (err) {
                return reject(err);
            } else {
                return resolve(result);
            }
        });
    });
}

//Insert new tires
exports.addNewTires = async function (body) {
    return await new Promise((resolve, reject) => {
        dbConn.query("INSERT INTO t_tires set ?", body, (err, result) => {
            if (err) {
                return reject(err);
            } else {
                return resolve(result.insertId);
            }
        });
    });
}


exports.deleteTire = async function (keyLlantacity, id) {
    return await new Promise((resolve, reject) => {
        dbConn.query("UPDATE t_tires SET isDeleted=1 WHERE keyLlantacity = ? and id=?", [keyLlantacity, id], function (err, result) {
            if (err) {
                return reject(err);
            } else {
                return resolve(result);
            }
        });
    });
}

exports.getProductTire = async function (keyLlantacity, id) {
    return await new Promise((resolve, reject) => {
        dbConn.query("Select * from t_tires WHERE keyLlantacity = ? and id=?", [keyLlantacity, id], function (err, result) {
            if (err) {
                return reject(err);
            } else {
                return resolve(result);
            }
        });
    });
}