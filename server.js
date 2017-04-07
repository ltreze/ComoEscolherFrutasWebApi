// server.js
// set up ============================================================
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var Sequelize = require('sequelize');
var multer = require('multer');
var fs = require('fs');
var async = require('async');
var path = require('path');
var formidable = require('formidable');
var async = require('async');

// configuration =====================================================
var app = express();
app.set('port', (process.env.PORT || 3000));
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ 'extended': 'true' }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
//configuracoes de upload
var storage = multer.diskStorage({
    destination: function (req, file, callback) { callback(null, './uploads'); },
    filename: function (req, file, callback) { callback(null, file.originalname); }
});
var uploadFruta = multer({ storage: storage });

//ORM
var connStr = process.env.COMO_MYSQL_CONNSTR;
var connection = mysql.createConnection(connStr);
connection.connect(function (err) { if (err) { console.error('error connecting: ' + err.stack); return; } console.log('connected as id ' + connection.threadId); });
var sequelize = new Sequelize(connStr, { define: { timestamps: false, freezeTableName: true } });

var Dica = sequelize.define('dica', {
    idDica: { type: Sequelize.INTEGER, field: 'idDica', allowNull: false, primaryKey: true, autoIncrement: true },
    nomeFruta: { type: Sequelize.STRING, field: 'nomeFruta', allowNull: false },
    descricao: { type: Sequelize.STRING, field: 'descricao', allowNull: false },
    nomeArquivo: { type: Sequelize.STRING, field: 'nomeArquivo', allowNull: false }
},
    { tableName: 'Dica' }
);

// routes ============================================================
app.post('/upload', function (req, res) {

    // var cache = [];
    // var req2 = JSON.stringify(req, function (key, value) {
    //     if (typeof value === 'object' && value !== null) {
    //         if (cache.indexOf(value) !== -1) {
    //             // Circular reference found, discard key
    //             return;
    //         }
    //         // Store value in our collection
    //         cache.push(value);
    //     }
    //     return value;
    // });
    // cache = null; // Enable garbage collection
    // console.log('\r\n\r\n req2');
    // console.log(req2);

    // create an incoming form object
    var form = new formidable.IncomingForm();
    form.multiples = false;
    form.uploadDir = path.join(__dirname, '/public/uploads');
    var nomeArquivoUpload = "";
    var nomePastaUpload = "";

    form.on('file', function (field, file) {
        tipo = file.type == 'image/png' ? '.png' : file.type == 'image/jpeg' ? '.jpg' : file.type == 'image/jpg' ? '.jpg' : "";
        nomeArquivoUpload = file.path;
        nomePastaUpload = form.uploadDir;
    });
    form.on('error', function (err) { console.log('An error has occured: \n' + err); });
    form.on('end', function () { });

    var idDica = 0;
    var nomeFruta = "";
    var descricaoDica = "";
    var nomeArquivo = "";
    var tipo = "";

    async
        .series([
            function parse(callback) {
                form.parse(req, function (err, fields, files) {
                    nomeFruta = fields.nomeFruta;
                    descricaoDica = fields.descricao;
                    idDica = fields.idDica;
                    callback();
                });
            },
            function salvar(callback) {
                nomeArquivo = nomeFruta.toLowerCase() + tipo;

                var objeto = idDica == 0 ? { nomeFruta: nomeFruta, descricao: descricaoDica, nomeArquivo: nomeArquivo } :
                    { idDica: idDica, nomeFruta: nomeFruta, descricao: descricaoDica, nomeArquivo: nomeArquivo };

                Dica.upsert(objeto).then(function (dica) {
                    fs.rename(nomeArquivoUpload, nomePastaUpload + '/' + nomeArquivo);
                    callback();
                });
            }
        ],
        function (err) {
            if (err != null) {
                return res.status(500).send(err);
            }

            res.redirect('/');
        });
});

app.get('/api/obterdicas', function (req, res) {

    Dica
        .findAll()
        .then(function (dicas) {
            res.json(dicas);
        });
});

app.post('/api/deletar', function (req, res) {
    console.log('\r\n\r\n********      deletar dica         ********');

    var idDica = req.body.idDica;
    console.log('idDica: ' + idDica);

    Dica
        .findAll({ where: { idDica: idDica } })
        .then(function (dica) {

            var dicaEncontrada = dica[0];
            console.log(dicaEncontrada);

            Dica
                .destroy({ where: { idDica: idDica } })
                .then(function () {
                    //req.session.valid = true;
                    res.redirect('/');
                });
        });

});

// app.post('/api/deletar', function (req, res) {
//     console.log('\r\n\r\n********      deletar dica         ********');

//     var idDica = req.body.idDica;
//     console.log('idDica: ' + idDica);

//     Dica
//         .destroy({ where: { idDica: idDica } })
//         .then(function () {
//             //req.session.valid = true;
//             res.redirect('/');
//         });

// });

app.post('/api/obterdica', function (req, res) {
    console.log('********      obterdica         ********');

    var idDica = req.body.idDica;

    Dica
        .findAll({ where: { idDica: idDica } })
        .then(function (dica) {

            console.log('***************************************');
            console.log('***     OBTENDO DICA');
            console.log('***');
            console.log('***    ' + JSON.stringify(dica));
            console.log('***');
            console.log('***************************************');

            if (dica.length <= 0)
                res.json({});

            res.json(dica[0]);
        });
});

app.get('/', function (req, res) {
    res.sendfile('./public/index.html');
});

app.get('/fetch', function (req, res) {
    res.send({ status: 'ok' });
});

app.get('/api/imagens', function (req, res) {
    //console.log(' - - - - - - - - imagens - - - - - - - - ');

    //console.log('__dirname');
    //console.log(__dirname);

    var todasImagens = [];

    const fs = require('fs');
    fs.readdir(__dirname + '/public/uploads', (err, files) => {

        //console.log('TODOS OS ARQUIVOS DO DIRETORIO');console.log(files);console.log('');

        async.series([
            function filesForEach(callback) {

                files.forEach(file => {
                    var img = { caminhoArquivo: file };
                    //console.log('img');console.log(img);
                    todasImagens.push(img);
                });
                callback();
            },
            function retorna(callback) {
                callback();
            }
        ],
            function (err) {
                if (err != null) return res.status(500).send(err);
                //console.log('todasImagens');
                //console.log(todasImagens);
                //console.log('');
                res.json(todasImagens);
            });
    });
});


// listen ============================================================
app.listen(app.get('port'), function () {
    console.log('ComoEscolherFrutasWebApi na porta', app.get('port'));
});
