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
        //console.log(req.body);
        if(email == null || password == null){
            res.status(400).json({'error': 'missing parameters'});
            return;
        }

        const params = {
            email: email,
            mdp: password,
          };
          //console.log(params);
          //console.log('params');
          axios.get(`${constantes.addrMobidycAPI}users/login`, { params })
          .then(async response => {
            //console.log(response.data);
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
            //console.log('OOOOOOOOOOOOOOOOOOOOOO');
            //console.log(response.data);
            //console.log('ppppppppppppppppppp');
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

    main: function(req, res){
        res.render('ejs/main', {
        });
    },

    cgu: function(req, res){
        res.render('ejs/cgu', {
        });
    },

    webLogin: function(req, res) {
        res.render('ejs/login', {})
    },

    webLogTraitement: function(req, res){
        //const fetch = require('node-fetch');
        const services = require("../modules/services");
        //const demarrage = require("../module/demarrage");
        import('node-fetch').then(async ({default: fetch}) => {
            // Votre utilisation de fetch ici
            var captchaVerified = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=6LfJ9_UoAAAAALT9encDqTVFJdk49VbWExxfYjfK&response=${req.body['g-recaptcha-response']}`, {
                method: 'POST'
            }).then(_res => _res.json());
            //console.log(captchaVerified);
            //console.log('ooooooooooo');
            if(captchaVerified.success == true){
                //Traitement contre les failles XSS
                var num = req.body.numero;
                num = num.replace(/<[^>]*>?/gm, '');
                const pass = req.body.password;
                
                //console.log(num+'  '+pass);
                req.body = {};
                req.body.email = mail
                req.body.mdp = pass;
                this.login(req, res).then((f) => {
                    console.log(f);
                    console.log('uuu');
                })
                services.webLogin(num, pass).then(function(data){
                    return;
                    console.log(data);
                    const state = data[0];
                    if(state){
                        const id = data[1][0];
                        const nom = data[1][1];
                        const prenom = data[1][2];
                        const panier = data[1][3];
                        const isEmailVerified = data[1][4];
                        //console.log(panier+'    99999999');
                        //console.log(nom+' '+prenom);
                        //console.log(panier+' &&&&&&&&&&');
                        req.session.idUser = id;
                        req.session.nameUser = nom+' '+prenom;
                        req.session.panier = panier;
                        req.session.isEmailVerified = isEmailVerified;
                        const previousPage = req.session.previousPage;
                        const localPage = req.session.localPage;
                        //console.log(localPage);
                        //console.log('tttttttt1');
                        //if(localPage != undefined && localPage != '' && !localPage.includes('/connexion') && !localPage.includes('/inscription')){
                        if(localPage != undefined && localPage.includes('/infoProduit')){
                            //console.log('tttttttt2');
                            demarrage.demarrage(req, '').then(function(d){
                                //console.log('tttttttt3');
                                //console.log(localPage);
                                res.redirect(localPage);
                                return;
                            }).catch((err) => {})
                        }else{
                            res.redirect('/');
                            return;
                        }
                    }else{
                        res.redirect('/connexion?err=404')
                        return;
                    }
                })
            }else{
                res.redirect('/connexion?err=450')
                return;
            }
          }).catch((err) => {
            // Gérez toute erreur liée à l'importation
            console.error('Erreur lors du chargement de node-fetch :', err);
          });
        
        
    }


}

