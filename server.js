
//Imports
var express = require('express');
var bodyParser = require("body-parser");
var fs = require('fs');
var apiRouter = require('./apiRouter').router;
var mongoose = require('mongoose');
const User = require("./model/User");
const Service = require("./model/Service");
const Transaction = require("./model/Transaction");
var service = require('./modules/services');
const { isNumberObject } = require('util/types');
/*service.fff();
return;*/
//Instatntiate server
var server = express();

//Body parser configuration
server.use(bodyParser.urlencoded({extended: true}));
server.use(bodyParser.json());

//Mongoose
const motDePasseEncode = encodeURIComponent("Mobi@RJdyc2023");
mongoose.connect(`mongodb://mobidyc_user:${motDePasseEncode}@31.207.35.19:27017/mobidyc`);

//Create a new user
//console.log(User);
/*service.fff();
console.log('ggg');
return;*/
/*const ut = Service.create({
    uid: "654f36cd5a0a492d5f3ad61a",
    apikey: "1234",
    nom: "Service1",
    
});
console.log(ut);
ut.then((e) => {
    console.log(e);
})*/

//Configure route
server.get('/', function(req, res){
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send('<h1>Bonjour sur non serveur</h1>');
});



// Middleware pour valider les adresses IP
const validateIPMiddleware = (req, res, next) => {
    // Charger la liste d'adresses IP autorisées depuis le fichier JSON
    const allowedIPsData = fs.readFileSync('allowedip.json', 'utf8');
    const allowedIPs = JSON.parse(allowedIPsData).allowedIPs;
    // Obtenir l'adresse IP du client
    const clientIP = req.ip || req.connection.remoteAddress;
    // Vérifier si l'adresse IP est autorisée
    /*console.log('VERIFICATION');
    console.log(clientIP);*/
    if (allowedIPs.includes(clientIP)) {
      // L'adresse IP est autorisée, continuez le traitement
      next();
    } else {
      // L'adresse IP n'est pas autorisée, renvoyez une réponse interdite (403)
      res.status(403).json({'error': 'accès interdit'});
    }
  };
  // Utilisez le middleware de validation des adresses IP pour toutes les routes
  server.use(validateIPMiddleware);

  server.use('/api/', apiRouter);

//Launch server
server.listen('8080', function(){
    console.log('Serveur en ecoute :)');
});