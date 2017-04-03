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
    var posts = [{frutaId: 1, nome: "Abacaxi", dica: "Lorem ipusm", nomeArquivo: "1280px-600px_HEX-008A79_rectangle_on_HEX-FEFCF0.svg.png"},
                 {frutaId: 2, nome: "Abacate", dica: "Lorem ipusm", nomeArquivo: "1280px-600px_HEX-008A79_rectangle_on_HEX-FEFCF0.svg.png"},
                 {frutaId: 3, nome: "Laranja", dica: "Lorem ipusm", nomeArquivo: "1280px-600px_HEX-008A79_rectangle_on_HEX-FEFCF0.svg.png"}];
//http://revistagloborural.globo.com/Revista/GloboRural/foto/0,,69789135,00.jpg
//https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/600px_HEX-008A79_rectangle_on_HEX-FEFCF0.svg/
    res.json(posts);
});

app.get('/fetch', function (req, res) {
    res.send({ status: 'ok'});
});

// listen ============================================================
app.listen(app.get('port'), function () {
    console.log('ComoEscolherFrutasWebApi na porta', app.get('port'));
});
