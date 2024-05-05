//Imports
var bcrypt = require('bcrypt');
var jwtUtils = require('../utils/jwt.utils');
var User = require('../model/User');
var axios = require('axios');
var constantes = require('../modules/constantes');
var service = require('../modules/services');
const { uid_to_socket } = require('../socketList');
//Routes
module.exports = {
    register: function(req, res){
        console.log('register');
        //Params
        //var email = req.body.email;
        var nom = req.body.nom;
        var prenom = req.body.prenom;
        var mail = req.body.mail;
        var password = req.body.mdp;
        
        //TODO verify pseudo length, mail rege, password etc.
        if(nom == null || password == null || prenom == null || mail == null){
            return res.status(400).json({'error': 'missing parameters'});
        }
        
        axios.post(`${constantes.addrMobidycAPI}users/register`,{
            nom: nom,
            prenom: prenom,
            mail: mail,
            mdp: password,
        }).then(async function(response) {
           //On renvoi l information au user
           res.status(response.status).json(response.data);
           return;
        }).catch((err) => {
            console.log(err);
            console.log('ERR_AXIOS_1: '+err.response?.data);
            res.status(err.response?.status).json(err.response?.data);
            return;
        });
        


    },
    login: function(req, res){
        /*const origin = req.get('Origin') || req.get('Referer');
        console.log(origin);
        return;*/
        //Params
        var email = req.body.email;
        var password = req.body.mdp;
        //console.log(email, password);
        console.log(req.body);
        if(email == null || password == null){
            res.status(400).json({'error': 'missing parameters'});
            return;
        }

        const params = {
            email: email,
            mdp: password,
          };
          console.log(params);
          console.log('params');
          axios.get(`${constantes.addrMobidycAPI}users/login`, { params })
          .then(async response => {
            console.log(response.data);
            var user = await User.findOne({mail: email});
            console.log("ON Verifi");
            if(user){
                //console.log(uid_to_socket);
                //On verifi si le user est deja connecte
                if(uid_to_socket[user._id.toString()] != undefined){
                    //Le user est deja connecte
                    res.status(509).json({'error': 'you are already connected'});
                    return;
                }
            }
            console.log('OOOOOOOOOOOOOOOOOOOOOO');
            console.log(response.data);
            console.log('ppppppppppppppppppp');
            res.status(response.status).json(response.data);
            return;
          })
          .catch(error => {
            console.log(error);
            console.error('Erreur lors de la requête GET :', error.message);
            var status = error.response?.status;
            status = (status == undefined)? 500 : status;
            //console.log(status);
            res.status(status).json({'error': 'une erreur est survenue lors de l operation'});
          });
        

    },
    logout: function(req, res) {
        var email = req.body.email;
        console.log(email);
    },
    update: function(req, res){
        console.log('register');
        //Params
        //var email = req.body.email;
        var data = req.body;
        //TODO verify pseudo length, mail rege, password etc.
        console.log(data);
        if(Object.keys(data).length == 0){
            return res.status(401).json({'error': 'missing parameters'});
        }
        
        axios.post(`${constantes.addrMobidycAPI}users/update`,data).then(async function(response) {
           //On renvoi l information au user
           
           console.log(response.status);
           res.status(response.status).json(response.data);
           return;
        }).catch((err) => {
            console.log(err);
            console.log('ERR_AXIOS_1: '+err.response?.data);
            res.status(err.response?.status).json(err.response?.data);
            return;
        });
        


    },

    resetPassword: function(req, res){
        var data = req.body;
        //TODO verify pseudo length, mail rege, password etc.
        if(Object.keys(data).length == 0){
            return res.status(400).json({'error': 'missing parameters'});
        }
        console.log(data);
        axios.post(`${constantes.addrMobidycAPI}users/reset/password`,data).then(async function(response) {
            //On renvoi l information au user
            res.status(response.status).json(response.data);
            return;
         }).catch((err) => {
             console.log(err);
             console.log('ERR_AXIOS_1: '+err.response?.data);
             var status = err.response?.status;
             status = (status != undefined)? status : 501;
             var data = (status != undefined)? err.response?.data : "Une erreure est survenue lors de l operation";
             res.status(status).json(data);
             return;
         });

    },

    confirmReset: function(req, res){
        const email = req.params.email;
        const link = req.params.link;
        service.confirmToken(email, link).then((d) => {
            //TO DO
            res.render('ejs/resetPassword', {
                email: email
            });
        }).catch((err) => {
            res.render('ejs/resetPasswordFail', {
                email: email
            });
            console.log(err);
            console.log('eeeeeeeeeeeee');
        });
    },

    resetPasswordDo: function(req, res){
        
        const email = req.params.email;
        const mdp = req.params.mdp;
        if(email == undefined || mdp == undefined){
            res.status(400).json({'error': 'Informations incompletes'});
            return;
        }
        service.resetPassordDo(email, mdp).then((d) => {
            res.status(200).send("Mot de passe modifie, vous pouvez retourner vous connecter");
            return;
        }).catch((err) => {
            console.log(err);
            res.status(400).send("Une erreure est survenue lors de l operation");
            return;
        })
        
    },

    
    verifEmailProcess: function(req, res){
        const service = require('../modules/services');
        const email = req.params.email;
        const link = req.params.link;
        service.confirmToken(email, link).then((d) => {
            //On met a jour la verification de l'email
            service.confirmEmail(email).then((dd) => {
                
                res.send("Votre email est verifie, vous pouvez desormais vous connecter.");
            })
            
        }).catch((err) => {
            res.send("Une erreure est survenue lors de l'operation.");
        });
    },

    cgu: function(req, res){
        res.render('ejs/cgu', {
        });
    }


}

