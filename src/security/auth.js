let headers = require('../public/headers');

function authentication(req, res, next) {
    var authheader = req.headers.authorization;
    console.log(req.headers);
 
    if (!authheader) {
        var err = new Error('You are not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');
        err.status = 401;
        return res.status(401).json(headers.getUnauthorizedResponse('Acceso no autorizado.'))
    }
 
    var auth = new Buffer.from(authheader.split(' ')[1],
    'base64').toString().split(':');
    var user = auth[0];
    var pass = auth[1];
 
    if (user == 'LLANTACITYDEVELOPMENT2022@FAB#AP22' && pass == 'LLANTACITYDEVELOPMENT2022@FAB#AP22L82SAL3XS') {
 
        // If Authorized user
        next();
    } else {
        var err = new Error('You are not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');
        err.status = 401;
        return res.status(401).json(headers.getUnauthorizedResponse('Acceso no autorizado.'))
    }
 
}

module.exports = authentication;