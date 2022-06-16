'use strict';
const mysql = require('mysql');
const config = require('config')

//local mysql db connection
const dbConn = mysql.createConnection({
  host: config.get('configDb.HOST'),
  user: config.get('configDb.USER'),
  password: config.get('configDb.PASSWORD'),
  database: config.get('configDb.DATABASE')
});
dbConn.connect(function (err) {
  if (err){
    console.warn(err)
    throw err;
  } 
    
  console.log("Database Connected to MYSQL!");
});
module.exports = dbConn;