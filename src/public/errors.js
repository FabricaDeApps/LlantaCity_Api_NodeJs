function getValidationJson(errors) {
    var errores = ""
    errors.forEach(element => {
        errores = errores + element.msg + " "
    });
    return errores
}

module.exports = {
    getValidationJson
}