const util = require("util");
const path = require('path');
const multer = require("multer");
const maxSize = 2 * 1024 * 1024;
const fs = require('fs');
const constantes = require('./constants');

let storage = multer.diskStorage({
  destination: (req, file, cb) => {  
    //cb(null, __basedir + "../../logos/");
    const dest = __basedir + constantes.EXCEL_FILES;
    fs.access(dest, function (error) {
      if (error) {
        console.log("Directory does not exist.");
        fs.mkdir(dest, { recursive: true }, (error) => cb(error, dest));
      } else {
        console.log("Directory exists.");
        cb(null, dest);
      }
    });
  },
  filename: (req, file, cb) => {
    if (!file.originalname.match(/\.(xlsx)$/)) {
      var err = new Error();
      err.code = 'filetype';
      return cb(err);
    } else {
      let ext = path.extname(file.originalname);      
      cb(null, "LlantaCityReg" + ext);
    }
  },
});

let uploadFile = multer({
  storage: storage,
  limits: { fileSize: maxSize },
}).single("file");



let uploadFileMiddleware = util.promisify(uploadFile);
module.exports = uploadFileMiddleware;