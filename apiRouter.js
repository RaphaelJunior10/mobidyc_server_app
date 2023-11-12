//Imports
var express = require('express');
var usersCtrl = require('./routes/usersCtrl');
const transCtrl = require('./routes/transCtrl');

//Router
exports.router = (function(){
    var apiRouter = express.Router();

    //Users routes
    apiRouter.route('/users/register/').post(usersCtrl.register);
    apiRouter.route('/users/login/').get(usersCtrl.login);

    //Transaction routes
    apiRouter.route('/trans/init').post(transCtrl.init);

    return apiRouter;
})();