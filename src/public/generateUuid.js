var uuid = require('uuid');
//generar uuid
function generateUuid() {
    var uuidG = uuid.v4()
    var replace = uuidG.toString();
    return replace;
}

function generatePass() {
    var uuidG = uuid.v4().substring(0, 8);
    var replace = uuidG.toString().replace(/-/gi, "");
    return replace;
}

module.exports = {
    generateUuid,
    generatePass
}