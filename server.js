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
const fileUpload = require('express-fileupload');

// configuration =====================================================
var app = express();
app.set('port', (process.env.PORT || 3000));
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ 'extended': 'true' }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
//configuracoes de upload

app.use(fileUpload());

var storage = multer.diskStorage({
    destination: function (req, file, callback) { callback(null, './uploads'); },
    filename: function (req, file, callback) { callback(null, file.originalname); }
});
var uploadFruta = multer({ storage: storage });

//ORM
var connStr = process.env.COMO_MYSQL_CONNSTR;
var connection = mysql.createConnection(connStr);
connection.connect(function (err) { if (err) { console.error('error connecting: ' + err.stack); return; } console.log('connected as id ' + connection.threadId + '\r\n'); });
var sequelize = new Sequelize(connStr, { define: { timestamps: false, freezeTableName: true } });

var Dica = sequelize.define('dica', {
    idDica: { type: Sequelize.INTEGER, field: 'idDica', allowNull: false, primaryKey: true, autoIncrement: true },
    nomeFruta: { type: Sequelize.STRING, field: 'nomeFruta', allowNull: false },
    descricao: { type: Sequelize.STRING, field: 'descricao', allowNull: false },
    nomeArquivo: { type: Sequelize.STRING, field: 'nomeArquivo', allowNull: false }
},
    { tableName: 'Dica' }
);

//HELPER
function createUUID() {
    // http://www.ietf.org/rfc/rfc4122.txt
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
}

// routes ============================================================
app.post('/upload', function (req, res) {
    if (!req.files)
        return res.status(400).send('No files were uploaded.');

    print(req.body);

    //console.log('\r\n\r\nreq.files');
    //console.log(req.files);
    //console.log('req.files.nomeArquivo');
    //console.log(req.files.nomeArquivo);
    //console.log('\r\n\r\n');

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file 
    let sampleFile = req.files.nomeArquivo;

    var idDica = 0;
    var nomeFruta = req.body.nomeFruta;
    var descricaoDica = req.body.descricao;
    var nomeArquivo = "";
    var tipo = "";
    var nomeArquivoUpload = "";
    var nomePastaUpload = "";
    var nomeFinal = "";

    console.log('\r\n**** sampleFile');
    console.log(sampleFile);
    idDica = req.body.idDica;
    var cadastrar = idDica == 0;
    var temArquivo = sampleFile != null;

    console.log('\r\n**** cadastrar');
    console.log(cadastrar);
    console.log('\r\n**** temArquivo');
    console.log(temArquivo);

    async
        .series([
            function persistir(callback) {
                // Use the mv() method to place the file somewhere on your server 

                //console.log('\r\n**** __dirname');
                //console.log(__dirname);
                //console.log('\r\n**** sampleFile.name');
                //console.log(sampleFile.name);

                if (temArquivo) {
                    nomeArquivoUpload = path.join(__dirname, '//public//uploads//', sampleFile.name);
                    //console.log('caminho');
                    //console.log(caminho);
                    sampleFile.mv(nomeArquivoUpload, function (err) {
                        if (err) console.log(err);

                        tipo = sampleFile.mimetype == 'image/png' ? '.png' : sampleFile.mimetype == 'image/jpeg' ? '.jpg' : sampleFile.mimetype == 'image/jpg' ? '.jpg' : "";
                        nomeArquivo = nomeFruta.toLowerCase() + tipo;

                        var posicao = nomeArquivoUpload.indexOf(sampleFile.name);
                        nomePastaUpload = nomeArquivoUpload.substring(0, posicao);

                        callback();
                    });
                } else {
                    callback();
                }
            },
            function salvar(callback) {

                if (cadastrar) {
                    var objeto = { nomeFruta: nomeFruta, descricao: descricaoDica, nomeArquivo: nomeArquivo };
                    Dica.create(objeto).then(function (dica) {


                        //comeco obter nome Arquivo
                        //                        var nomeArquivoPad = ;
                        var nomeArquivoPadTipo = String("00000" + dica.idDica).slice(-6) + tipo;
                        nomeFinal = nomePastaUpload + '\\' + nomeArquivoPadTipo;

                        fs.rename(nomeArquivoUpload, nomeFinal, function (res) {
                            console.log('callback rename');
                            console.log(res);
                        });

                        console.log('\r\n**** nomeArquivoPadTipo');
                        console.log(nomeArquivoPadTipo);
                        dica.nomeArquivo = nomeArquivoPadTipo;

                        console.log('\r\n**** dica');
                        console.log(JSON.stringify(dica));

                        dica
                            .updateAttributes({ nomeArquivo: nomeArquivoPadTipo })
                            .then(function () {
                                //fs.rename(nomeArquivoUpload, nomePastaUpload + '/' + nomeArquivo);
                                callback();
                            });
                    });
                } else {
                    var objeto = {};

                    nomeArquivo = String("00000" + idDica).slice(-6) + tipo;
                    console.log("\r\n**** nomeArquivoo");
                    console.log(nomeArquivo);

                    if (temArquivo) {
                        objeto = { idDica: idDica, nomeFruta: nomeFruta, descricao: descricaoDica, nomeArquivo: nomeArquivo };
                    } else {
                        objeto = { idDica: idDica, nomeFruta: nomeFruta, descricao: descricaoDica };
                    }

                    console.log("\r\n**** objeto");
                    console.log(objeto);

                    Dica
                        .update(objeto, { where: { idDica: idDica } })
                        .then(function (dica) {
                            //console.log('**** UPSERT ');
                            //console.log('**** dica');
                            //console.log(JSON.stringify(dica));
                            //console.log(dica);
                            //console.log('**** nomeArquivoUpload');
                            //console.log(nomeArquivoUpload);
                            //console.log('**** nomePastaUpload');
                            //console.log(nomePastaUpload);
                            //console.log('**** nomeFinal');
                            nomeFinal = nomePastaUpload + '\\' + nomeArquivo;
                            //console.log(nomeFinal);

                            fs.rename(nomeArquivoUpload, nomeFinal, function (res) {
                                console.log('callback rename');
                                console.log(res);
                            });

                            callback();
                        });
                }
            }
        ],
        function (err) {
            if (err != null) {
                return res.status(500).send(err);
            }

            res.redirect('/');
        });
});

function print(obj) {

    console.log('\r\n\r\n************* print');

    var cache = [];
    var req2 = JSON.stringify(obj, function (key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
                // Circular reference found, discard key
                return;
            }
            // Store value in our collection
            cache.push(value);
        }
        return value;
    });
    cache = null; // Enable garbage collection
    console.log('\r\n\r\n req2');
    console.log(req2);
}


app.post('/upload2', function (req, res) {

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

    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = false;

    // store all uploads in the /uploads directory
    form.uploadDir = path.join(__dirname, '/public/uploads');

    //var nomeArquivoUpload = "";
    //var nomePastaUpload = "";

    // every time a file has been uploaded successfully,
    // rename it to it's orignal name
    //form.on('fileBegin', function(name, file) {
    //var nome = createUUID();
    //console.log('var nome = createUUID();');
    //console.log(nome);
    //file.name = nome;
    //});

    form.on('file', function (field, file) {
        //console.log('FORM ON > file.path ' + file.path);
        //console.log('FORM ON > file.uploadDir ' + file.uploadDir);

        //tipo = file.type == 'image/png' ? '.png' : file.type == 'image/jpeg' ? '.jpg' : file.type == 'image/jpg' ? '.jpg' : "";
        //nomeArquivoUpload = file.path;
        //nomePastaUpload = form.uploadDir;

        //console.log('FORM ON > nomeArquivoUpload ' + nomeArquivoUpload);
        //console.log('FORM ON > nomePastaUpload ' + nomePastaUpload);

        fs.rename(file.path, path.join(form.uploadDir, file.name));
    });

    // log any errors that occur
    form.on('error', function (err) {
        console.log('An error has occured: \n' + err);
    });

    // once all the files have been uploaded, send a response to the client
    form.on('end', function () {
        res.redirect('/');
    });

    form.parse(req);

    //var idDica = 0;
    //var nomeFruta = "";
    //var descricaoDica = "";
    //var nomeArquivo = "";
    //var tipo = "";
    /*
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
                    var cadastrar = idDica == 0;
    
                    if (cadastrar) {
                        var objeto = { nomeFruta: nomeFruta, descricao: descricaoDica, nomeArquivo: nomeArquivo };
                        Dica.create(objeto).then(function (dica) {
                            //var dicaCriada = JSON.stringify(dica);
    
                            console.log('****!! dica');
                            console.log(JSON.stringify(dica));
    
                            var nomeArquivoPad = String("00000" + dica.idDica).slice(-6);
    
                            console.log('****%% nomeArquivoPad');
                            console.log(nomeArquivoPad);
    
                            var nomeArquivoPadTipo = nomeArquivoPad + tipo;
                            var nomeFinal = nomePastaUpload + '\\' + nomeArquivoPadTipo;
                            console.log('');console.log('');console.log('');console.log('');console.log('');
                            console.log('*$$$$$$$ nomeArquivoUpload');
                            console.log(nomeArquivoUpload);
                            fs.rename(nomeArquivoUpload, nomeFinal, function(res){
                                console.log('callback rename');
                                console.log(res);
                            });
                            //fs.unlink(nomeArquivoUpload, function(res){
                                //console.log(res);
                            //});
    
                            console.log('**** nomeArquivoPadTipo');
                            console.log(nomeArquivoPadTipo);
                            dica.nomeArquivo = nomeArquivoPadTipo;
    
                            console.log('**** dica');
                            console.log(JSON.stringify(dica));
    
    
                            dica
                                .updateAttributes({ nomeArquivo: nomeArquivoPadTipo })
                                .then(function () {
                                    console.log('****!!!!!!!!!!!!!!!!!!!!!!'); callback();
                                });
                        });
                    } else {
                        var objeto = { idDica: idDica, nomeFruta: nomeFruta, descricao: descricaoDica, nomeArquivo: nomeArquivo };
    
                        Dica.upsert(objeto).then(function (dica) {
                            console.log('**** dica');
                            console.log(JSON.stringify(dica));
                            console.log('');console.log('');console.log('');console.log('');console.log('');
                            console.log('!!** nomeArquivoUpload');
                            console.log(nomeArquivoUpload);
                            console.log('!!** nomePastaUpload');
                            console.log(nomePastaUpload);
                            console.log('!!** nomeArquivo');
                            console.log(nomeArquivo);
                            
                            fs.renameSync(nomeArquivoUpload, nomePastaUpload + '/' + nomeArquivo);
                            //fs.unlink()
                            callback();
                        });
                    }
                }
            ],
            function (err) {
                if (err != null) {
                    return res.status(500).send(err);
                }
    
                res.redirect('/');
            });*/

    //res.redirect('/');
});

app.get('/api/obterdicas', function (req, res) {

    Dica
        .findAll()
        .then(function (dicas) {
            res.json(dicas);
        });
});

app.post('/api/obterimagem', function (req, res) {

    var id = req.body.idDica;
    console.log('id'); console.log(id);

    var idImg = String("00000" + id).slice(-6);
    console.log('idImg'); console.log(idImg);

    var todasImagens = [];

    const fs = require('fs');
    fs.readdir(__dirname + '/public/uploads', (err, files) => {

        //console.log('TODOS OS ARQUIVOS DO DIRETORIO');console.log(files);console.log('');

        //async.series([
        //  function filesForEach(callback) {

        files.forEach(file => {
            //var img = { caminhoArquivo: file };
            console.log('img'); console.log(file);
            //todasImagens.push(img);
        });
        //    callback();
        //},
        //function retorna(callback) {
        //   callback();
        // }
        //],
        //   function (err) {
        //      if (err != null) return res.status(500).send(err);
        //console.log('todasImagens');
        //console.log(todasImagens);
        //console.log('');
        //     res.json(todasImagens);
        // });
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
    console.log('');
});
