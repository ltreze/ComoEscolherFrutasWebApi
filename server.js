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

// configuration =====================================================
var app = express();
app.set('port', (process.env.PORT || 3000));
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ 'extended': 'true' }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
var upload = multer({ dest: 'uploads/' })

//ORM
var connStr = process.env.COMO_MYSQL_CONNSTR;
var connection = mysql.createConnection(connStr);
connection.connect(function(err) {if (err) {console.error('error connecting: ' + err.stack);return;}console.log('connected as id ' + connection.threadId);});
var sequelize = new Sequelize(connStr, {define: {timestamps: false,freezeTableName: true}});

var Dica = sequelize.define('dica', {
    idDica: {type: Sequelize.INTEGER,field:'idDIca',allowNull:false,primaryKey:true,autoIncrement:true},
    nomeFruta: {type: Sequelize.STRING,field:'nomeFruta',allowNull:false},
    descricao: {type: Sequelize.STRING,field:'descricao',allowNull:false},
    nomeArquivo: { type: Sequelize.STRING,field:'nomeArquivo',allowNull:false}
	}, 
    { tableName: 'Dica' } 
);

// routes ============================================================
app.post('/upload', upload.single('fruta'), function (req, res, next) {

	console.log('*** upload ***');
    console.log('req.body');
    console.log(req.body);
    console.log('');

    res.json({});
})

app.get('/api/obterdicas', function (req, res) {
    console.log('********      obterdicas         ********');

    Dica
        .findAll()
        .then(function (dicas) {

            console.log('***************************************');
            console.log('***     OBTENDO DICAS');
        	console.log('***');
        	console.log('***    ' + JSON.stringify(dicas));
        	console.log('***');
            console.log('***************************************');

            res.json(dicas);
        });
});

app.post('/api/salvardica', function (req, res) {
	console.log(req.body);
	
	var proximoIdDica = dicas[dicas.length-1].frutaId + 1;
	console.log(proximoIdDica);
	dicas.push({frutaId: proximoIdDica, nome: req.body.nomeFruta, dica: req.body.dica, nomeArquivo: req.body.nomeArquivo});

    res.send({ status: 'ok'});
});

app.get('/', function(req,res){
    res.sendfile('./public/index.html'); 
});

app.get('/fetch', function (req, res) {
    res.send({ status: 'ok'}); 
});

app.get('/api/imagens', function(req, res){
    console.log(' - - - - - - - - imagens - - - - - - - - ');
    
    console.log('__dirname');
    console.log(__dirname);

    var todasImagens = [];

    const fs = require('fs');
    fs.readdir(__dirname + '/public/uploads', (err, files) => {

        console.log('TODOS OS ARQUIVOS DO DIRETORIO');console.log(files);console.log('');

        async.series([
            function filesForEach(callback){

                files.forEach(file => {
                    var img = { caminhoArquivo: file };

                    console.log('img');console.log(img);

                    todasImagens.push(img);
                });
                callback();
            }, 
            function retorna(callback){
                callback();
            }
        ], 
        function(err) { 
            if (err != null) return res.status(500).send(err);
            console.log('todasImagens');
            console.log(todasImagens);
            console.log('');
            res.json(todasImagens);
        });
    });
});


// listen ============================================================
app.listen(app.get('port'), function () {
    console.log('ComoEscolherFrutasWebApi na porta', app.get('port'));
});
