const constantes = require('../public/constants');

function getBadErrorResponse(message, error) {
    return { header: { status: constantes.CONFLICT, code: 400, message: message }, data: error == null || error == undefined ? null : error }
}

function getInternalErrorResponse(message, error) {
    return { header: { status: constantes.CONFLICT, code: 500, message: message }, data: error }
}

function getSuccessResponse(message, data) {
    return { header: { status: constantes.SUCCESS, code: 200, message: message }, data: data  }
}

function getUnauthorizedResponse(message) {
    return { header: { status: constantes.UNAUTHORIZED, code: 401, message: message } }
}


module.exports = {
    getBadErrorResponse,
    getInternalErrorResponse,
    getUnauthorizedResponse,
    getSuccessResponse
}