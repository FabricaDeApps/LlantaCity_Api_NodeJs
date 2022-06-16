const express = require('express')
const app = express();
const cors = require("cors");
const tires_route = require('./src/routes/tires.route')
const auth = require('./src/security/auth');
const fs = require('fs');
const https = require('https');
global.__basedir = __dirname;
const api = "/api/v1/"
var corsOptions = {
    origin: "*"
};

app.use(express.json())
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }))


// define a root route
app.get('/', (req, res) => {
    res.send("Api LLANTACITY Js en ejecución...");
});


//Rutas
app.use(api + 'tires', auth, tires_route)

const port = process.env.PORT || 8083;

process.env.TZ = 'America/Mexico_City'

if (process.env.NODE_ENV === "production") {
    const httpsOptions = {
        cert: fs.readFileSync("./src/ssl/certificate.crt"),
        ca: fs.readFileSync("./src/ssl/ca_bundle.crt"),
        key: fs.readFileSync("./src/ssl/private.key"),
    };
    const httpsServer = https.createServer(httpsOptions, app);
    httpsServer.listen(port, () => {
        console.log(`Api LLANTACITY, ejecutandose... HTTPS on port ${port}`);
    });
} else {
    app.listen(port, () => {
        console.log(new Date().toString());
        console.log(`Api LLANTACITY, ejecutandose... HTTP on port ${port}`);
    })
}