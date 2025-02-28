//Imports
var express = require('express');
var usersCtrl = require('./routes/usersCtrl');
const transCtrl = require('./routes/transCtrl');
const mobCtrl = require('./routes/mobCtrl');

//Router
exports.router = (function(){
    var webRouter = express.Router();

    //Users routes
    webRouter.route('/').get(usersCtrl.main);
    webRouter.route('/cgu').get(usersCtrl.cgu);    
    //webRouter.route('/login').get(usersCtrl.webLogin);
    //webRouter.route('/webLogin/traitement').post(usersCtrl.webLogTraitement);
   

    

    return webRouter;
})();