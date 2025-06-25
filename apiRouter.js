//Imports
var express = require('express');
var usersCtrl = require('./routes/usersCtrl');
const transCtrl = require('./routes/transCtrl');
const mobCtrl = require('./routes/mobCtrl');

//Router
exports.router = (function(){
    var apiRouter = express.Router();

    //Users routes
    apiRouter.route('/users/register/').post(usersCtrl.register);
    apiRouter.route('/users/login/').post(usersCtrl.login);
    apiRouter.route('/users/logout/').post(usersCtrl.logout);
    apiRouter.route('/users/update/').post(usersCtrl.update);
    apiRouter.route('/users/reset/password').post(usersCtrl.resetPassword);
    apiRouter.route('/users/reset/password/:email/:link').get(usersCtrl.confirmReset);
    apiRouter.route('/users/reset/password/init/:email/:mdp').get(usersCtrl.resetPasswordDo);
    apiRouter.route('/users/verifEmail/:email/:link').get(usersCtrl.verifEmailProcess);
    apiRouter.route('/cgu').get(usersCtrl.cgu);

    apiRouter.route('/cgu_puzzleme').get(usersCtrl.cgu_puzzleme);
    apiRouter.route('/puzzleme/data/delete').get(usersCtrl.deleteData);
    
    
    //Transaction routes
    apiRouter.route('/trans/init').post(transCtrl.init);

    //Pour informer l utilisateur de le transaction
    apiRouter.route('/trans/inform').post(transCtrl.inform);

    //Transaction routes
    apiRouter.route('/mob/auth').post(mobCtrl.get_auth);

    

    return apiRouter;
})();