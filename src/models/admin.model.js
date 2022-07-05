'use strict';
var dbConn = require('../../database/db.config');

exports.addAdmin = async function (body) {
    return await new Promise((resolve, reject) => {
        dbConn.query("INSERT INTO t_admin set ?", body, (err, result) => {
            if (err) {
                return reject(err);
            } else {
                return resolve(result);
            }
        });
    });
}

exports.updateAdmin = async function (body) {
    return await new Promise((resolve, reject) => {
        dbConn.query("UPDATE t_admin SET name=?, last_name=?, email=?, modified_date=?, type=? WHERE hash_admin = ?", [body.name, body.last_name, body.email, new Date(), body.type, body.hash_admin], function (err, result) {
            if (err) {
                return reject(err);
            } else {
                return resolve(result);
            }
        });
    });
}


exports.loginAdmin = async function (email) {
    return await new Promise((resolve, reject) => {
        dbConn.query("Select * from t_admin WHERE email = ?", email, function (err, result) {
            if (err) {
                return reject(err);
            } else {
                return resolve(result);
            }
        });
    });
}


exports.deleteAdmin = async function (hash_admin) {
    return await new Promise((resolve, reject) => {
        dbConn.query("UPDATE t_admin SET is_deleted=1, modified_date=? WHERE hash_admin = ?", [new Date(), hash_admin], function (err, result) {
            if (err) {
                return reject(err);
            } else {
                return resolve(result);
            }
        });
    });
}

exports.findByHash = async function (hash_admin) {
    return await new Promise((resolve, reject) => {
        dbConn.query("Select * from t_admin where hash_admin = ?", hash_admin, function (err, result) {
            if (err) {
                return reject(err);
            } else {
                return resolve(result);
            }
        });
    });
}

exports.changePassword = async function (body) {
    return await new Promise((resolve, reject) => {
        dbConn.query("UPDATE t_admin SET password=?, modified_date=? WHERE hash_admin = ?", [body.new_password, new Date(), body.hash_admin], function (err, result) {
            if (err) {
                return reject(err);
            } else {
                return resolve(result);
            }
        });
    });
}

exports.getAllAdmins = async function (request) {
    return await new Promise((resolve, reject) => {
        const limit = request.limit
        // page number
        const page = request.page
        // calculate offset
        const offset = (page - 1) * limit
        dbConn.query("Select * from t_admin where is_deleted = 0 LIMIT " + limit + " OFFSET " + offset, function (err, result) {
            if (err) {
                return reject(err);
            } else {
                dbConn.query("SELECT COUNT(*) AS cantidad FROM t_admin where is_deleted = 0", function (err, quantity) {
                    if (err) {
                        return reject(err);
                    } else {
                        var jsonResult = {
                            'total': quantity[0].cantidad,
                            'per_page': limit,
                            'current_page': page,
                            'last_page': Number.isInteger(quantity[0].cantidad / limit) ? Math.round(quantity[0].cantidad / limit) : Math.round(quantity[0].cantidad / limit) + 1
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