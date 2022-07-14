'use strict';
var dbConn = require('../../database/db.config');


exports.getAllProveedoresActive = async function () {
    return await new Promise((resolve, reject) => {
        dbConn.query("Select * from t_proveedores where active = 1", function (err, result) {
            if (err) {
                return reject(err);
            } else {
                return resolve(result);
            }
        });
    });
}


exports.getProveedorById = async function (idProveedor) {
    return await new Promise((resolve, reject) => {
        dbConn.query("Select * from t_proveedores where idProveedor = ?", idProveedor, function (err, result) {
            if (err) {
                return reject(err);
            } else {
                return resolve(result);
            }
        });
    });
}
