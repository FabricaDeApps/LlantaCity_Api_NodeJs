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

exports.getAllTiresPagination = async function (request) {
    return await new Promise((resolve, reject) => {
        const limit = request.limit
        // page number
        const page = request.page
        // calculate offset
        const offset = (page - 1) * limit
        dbConn.query("Select * from t_tires LIMIT " + limit + " OFFSET " + offset, function (err, result) {
            if (err) {
                return reject(err);
            } else {
                dbConn.query("SELECT COUNT(*) AS cantidad FROM t_tires", function (err, quantity) {
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