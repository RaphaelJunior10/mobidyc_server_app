
/*const bcrypt = require('bcrypt');
bcrypt.hash('1234', 5, function(err, bcryptedPassword){
  console.log(bcryptedPassword);
});
return;*/
//Imports
var express = require('express');
var bodyParser = require("body-parser");
var fs = require('fs');
var http = require('http');
//const socketIO = require('socket.io');
const cors = require('cors');
var apiRouter = require('./apiRouter').router;
var mongoose = require('mongoose');
const socketManager = require('./socketManager');
const User = require("./model/User");
const Service = require("./model/Service");
const Transaction = require("./model/Transaction");
var service = require('./modules/services');
const { isNumberObject } = require('util/types');
const path = require('path');
const socketMiddleware = require('./socketMiddleware');

const { uid_to_socket,  socket_id_to_uid } = require('./socketList');


/*service.fff();
return;*/
//Instatntiate server
//var server = express();

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});
//const io = socketIO(server);
//const io = new Server(server, { cors: { origin: '*' } });
//io.set('origins', '*:*');
//Body parser configuration
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Mongoose
const motDePasseEncode = encodeURIComponent("Mobi@RJdyc2023");
//mongoose.connect(`mongodb://mobidyc_user:${motDePasseEncode}@31.207.35.19:27017/mobidyc`);
mongoose.connect(`mongodb://127.0.0.1:27017/mobidyc`);

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

// Middleware pour parser les requêtes POST
app.use(express.json());
app.use(socketMiddleware(uid_to_socket,  socket_id_to_uid));
socketManager(io, uid_to_socket,  socket_id_to_uid);
// Endpoint pour recevoir les requêtes POST
app.get('/p1', (req, res) => {
  // Traitez la requête POST ici
  console.log('Requête POST reçue:', req.body);
  console.log(req.socket_id_to_uid);
  console.log(req.uid_to_socket);

  // Envoyez une réponse au client
  res.json({ message: 'Requête POST reçue avec succès.' });
});




//Configure route
app.get('/', function(req, res){
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send('<h1>Bonjour sur non serveur</h1>');
});

app.get('/cgu', function(req, res){
  res.render('ejs/cgu', {
  });
})



// Middleware pour valider les adresses IP
  // Utilisez le middleware de validation des adresses IP pour toutes les routes
  app.use('/assets', express.static(__dirname + '/assets'));
  app.use('/app/', apiRouter);

//Launch server
server.listen('3100', function(){
    console.log('Serveur en ecoute :)');
});