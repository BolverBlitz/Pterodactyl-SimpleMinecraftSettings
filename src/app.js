const HyperExpress = require('hyper-express');
const fs = require('fs');
const path = require('path');
const app = new HyperExpress.Server();
const { log } = require('@lib/logger');

const api_pterodactyl = require('./api_pterodactyl');

/* Server Static Files */
app.get('/', (req, res) => {
    res.header('Content-Type', 'text/html');
    res.send(fs.readFileSync(path.join(__dirname, '..', 'www-public', 'index.html')));
})

app.get('/assets/*', (req, res) => {
    if (req.url.endsWith('.js')) { res.header('Content-Type', 'text/javascript'); } else { res.header('Content-Type', 'text/css'); }
    res.send(fs.readFileSync(path.join(__dirname, '..', 'www-public', req.url)));
})

app.use('/api/pterodactyl', api_pterodactyl);

/* Handlers */
app.set_error_handler((req, res, error) => {
    let statusCode = res.statusCode !== 200 ? res.statusCode : 500;

    /* Returns 400 if the client didn´t provide all data/wrong data type*/
    if (error.name === "ValidationError" || error.name === "InvalidOption") {
        statusCode = 400;
    }

    /* Returns 500 if there was a problem communicating to Unifi Controler*/
    if (error.message === "JSPteroAPIError") {
        statusCode = 500;
    }

    log.error(`[${statusCode}] ${req.method} "${req.url}" >> ${error.message}`);
    res.status(statusCode);
    res.json({
        message: error.message
    });
});


module.exports = app;