// server.js
// set up ========================
var express = require('express');
var app = express();
var morgan = require('morgan');
var bodyParser = require('body-parser');
var url = require('url');

// configuration ==================
app.set('port', (process.env.PORT || 3000));
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ 'extended': 'true' }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser({ uploadDir: '/path/to/temporary/directory/to/store/uploaded/files' }));

// routes ==================================================
app.get('/api/obterfrutas', function (req, res) {
    var posts = [{ID: 1, Nome: "Abacaxi", Dica: "Lorem ipusm"},
                 {ID: 1, Nome: "Abacate", Dica: "Lorem ipusm"},
                 {ID: 1, Nome: "Laranja", Dica: "Lorem ipusm"}];

    res.json(posts);
});

app.get('/fetch', function (req, res) {
    res.send({ status: 'ok'});
});

// listen ======================================
app.listen(app.get('port'), function () {
    console.log('ComoEscolherFrutasWebApi na porta', app.get('port'));
});
