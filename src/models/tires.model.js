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