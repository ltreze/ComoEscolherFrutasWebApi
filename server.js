// server.js
// set up ============================================================
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');

// configuration =====================================================
var app = express();
app.set('port', (process.env.PORT || 3000));
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ 'extended': 'true' }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

// routes ============================================================
app.get('/api/obterfrutas', function (req, res) {
    var posts = [{ID: 1, Nome: "Abacaxi", Dica: "Lorem ipusm"},
                 {ID: 2, Nome: "Abacate", Dica: "Lorem ipusm"},
                 {ID: 3, Nome: "Laranja", Dica: "Lorem ipusm"}];

    res.json(posts);
});

app.get('/fetch', function (req, res) {
    res.send({ status: 'ok'});
});

// listen ============================================================
app.listen(app.get('port'), function () {
    console.log('ComoEscolherFrutasWebApi na porta', app.get('port'));
});
