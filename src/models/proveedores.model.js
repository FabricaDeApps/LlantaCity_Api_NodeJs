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

exports.getProveedorByName = async function (nombreComercial) {
    return await new Promise((resolve, reject) => {
        dbConn.query("Select * from t_proveedores where nombreComercial = ?", nombreComercial, function (err, result) {
            if (err) {
                return reject(err);
            } else {
                return resolve(result);
            }
        });
    });
}

exports.getAllProveedores = async function (request) {
    return await new Promise((resolve, reject) => {
        const limit = request.limit
        // page number
        const page = request.page
        // calculate offset
        const offset = (page - 1) * limit
        dbConn.query("Select * from t_proveedores LIMIT " + limit + " OFFSET " + offset, function (err, result) {
            if (err) {
                return reject(err);
            } else {
                dbConn.query("SELECT COUNT(*) AS cantidad FROM t_proveedores", function (err, quantity) {
                    if (err) {
                        return reject(err);
                    } else {
                        var jsonResult = {
                            'total': quantity[0].cantidad,
                            'per_page': limit,
                            'current_page': page,
                            'last_page': Number.isInteger(quantity[0].cantidad / limit) ? Math.round(quantity[0].cantidad / limit) : Math.ceil(quantity[0].cantidad / limit)
                        }
                        for (var i of result) {
                            delete i.password;
                        }
                        return resolve({ pagination: jsonResult, users: result });
                    }
                });
            }
        });
    });
}

exports.addProveedor = async function (body) {
    return await new Promise((resolve, reject) => {
        dbConn.query("INSERT INTO t_proveedores set ?", body, (err, result) => {
            if (err) {
                return reject(err);
            } else {
                return resolve(result);
            }
        });
    });
}


exports.updateProveedor = async function (body) {
    return await new Promise((resolve, reject) => {
        dbConn.query("UPDATE t_proveedores SET razonSocial=?, nombreComercial=?, direccion=?, municipio=?, estado=?, email=?, paginaWeb=?, telefono=?, ciudad=?, rfc=?, contacto=? WHERE idProveedor = ?", 
        [body.razonSocial, body.nombreComercial, body.direccion, body.municipio, body.estado, body.email, body.paginaWeb, body.telefono, body.ciudad, body.rfc, body.contacto, body.idProveedor], function (err, result) {
            if (err) {
                return reject(err);
            } else {
                return resolve(result);
            }
        });
    });
}

exports.changeStatus = async function (body) {
    return await new Promise((resolve, reject) => {
        dbConn.query("UPDATE t_proveedores SET active=? WHERE idProveedor = ?", [body.active, body.idProveedor], function (err, result) {
            if (err) {
                return reject(err);
            } else {
                return resolve(result);
            }
        });
    });
}