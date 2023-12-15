//Imports
var bcrypt = require('bcrypt');
var jwtUtils = require('../utils/jwt.utils');
var services = require('../modules/services');
const constantes = require('../modules/constantes');
var User = require('../model/User');

//Routes
module.exports = {
    init: function(req, res){
        //Verification structurale des parametres
        services.tr_check_modele(req.body).then((modele) => {
            //Verification d authentification
            services.tr_check_auth(req.ip, req.body, modele).then(({rid, sid}) => {
                const Modeles = constantes.Modeles;
                //On traite chaque cas selon lo modele
                if(modele == Modeles.MOB_TO_SERVICE || modele == Modeles.MOB_TO_MOB){
                    //On verifi si le user a assez de mob
                    services.isUserEnoughtMOB(sid, req.body.montant).then((bl) => {
                        //On initialise la transaction
                        services.transINIT(req.body, modele).then(({transID, description}) => {
                            //On procede a la requette d'autorisation aupres du client
                            services.req_MOB_AUTH(sid, req.body.montant, description).then((bl2) => {
                                //Le client a valide, on pocede au transfert de mob
                                services.decrementMOB(sid, req.body.montant).then((dd) => {
                                    services.incrementMOB(rid, req.body.montant).then((dd2) => {
                                        //On met a jour le status de la transaction
                                        services.updateStatusTrans(transID, constantes.state.SUCCESS).then(() => {
                                            //On retourne au demandeur le status de la requette
                                            var data = (req.body.data == undefined)? {} : req.body.data;
                                            res.status(200).json({
                                                montant: req.body.montant,
                                                data: data
                                            });
                                        }).catch((err) => {
                                            res.status(403).json(err);
                                        })
                                        
                                    }).catch((err) => {
                                        console.log(err);
                                        res.status(403).json(err);
                                    })
                                }).catch((err) => {
                                    console.log(err);
                                    res.status(403).json(err);
                                })
                            }).catch((err) => {
                                console.log('ERR_REQ_MOB_AUTH: '+err);
                                services.updateStatusTrans(transID, constantes.state.ECHEC);
                                req.status(403).json({'error': 'autorization refused'});
                            })
                        }).catch((err) => {
                            console.log('ERR_TO_TR_INIT: '+err);
                            res.status(403).json(err);
                        });
                    }).catch((err) => {
                        res.status(400).json(err);
                    })
                }else if(modele == Modeles.NUMBER_TO_SERVICE || modele == Modeles.NUMBER_TO_MOB){
                    //On initialise la transaction
                    services.transINIT(req.body, modele).then(({transID, description}) => {
                        console.log(transID);
                        //On procede a la requette vers SingPay
                        services.req_NUM_AUTH(rid, sid, req.body.montant, description).then((dd) => {
                            //Le client a valide, on pocede au transfert de mob
                                services.incrementMOB(rid, req.body.montant).then((dd2) => {
                                    //On met a jour le status de la transaction
                                    services.updateStatusTrans(transID, constantes.state.SUCCESS).then(() => {
                                        //On retourne au demandeur le status de la requette
                                        var data = (req.body.data == undefined)? {} : req.body.data;
                                        res.status(200).json({
                                            montant: req.body.montant,
                                            data: data
                                        });
                                    }).catch((err) => {
                                        res.status(403).json(err);
                                    })
                                    
                                }).catch((err) => {
                                    console.log(err);
                                    res.status(403).json(err);
                                })
                        }).catch((err) => {
                            console.log('ERR_REQ_NUM_AUTH:  '+err);
                            services.updateStatusTrans(transID, constantes.state.ECHEC);
                            req.status(403).json({'error': 'autorization refused'});
                        })

                    }).catch((err) => {
                        console.log('ERR_TO_TR_INIT: '+err);
                        res.status(403).json(err);
                    });
                }else if(modele == Modeles.MOB_TO_NUMBER){
                    services.transINIT(req.body, modele).then(({transID, description}) => {
                        //On procede a la requette vers SingPay
                        services.req_MOB_AUTH(sid, req.body.montant, description).then((dd) => {
                            //Le client a valide, on pocede au transfert de mob
                                services.decrementMOB(sid, req.body.montant).then((dd2) => {
                                    //On met a jour le status de la transaction
                                    services.updateStatusTrans(transID, constantes.state.SUCCESS).then(() => {
                                        //On retourne au demandeur le status de la requette
                                        var data = (req.body.data == undefined)? {} : req.body.data;
                                        res.status(200).json({
                                            montant: req.body.montant,
                                            data: data
                                        });
                                    }).catch((err) => {
                                        res.status(403).json(err);
                                    })
                                    
                                }).catch((err) => {
                                    console.log(err);
                                    res.status(403).json(err);
                                })
                        }).catch((err) => {
                            console.log('ERR_REQ_NUM_AUTH:  '+err);
                            services.updateStatusTrans(transID, constantes.state.ECHEC);
                            req.status(403).json({'error': 'autorization refused'});
                        })

                    }).catch((err) => {
                        console.log('ERR_TO_TR_INIT: '+err);
                        res.status(403).json(err);
                    });
                }else if(modele == Modeles.NUMBER_TO_NUMBER){
                    services.transINIT(req.body, modele).then(({transID, description}) => {
                        //On procede a la requette vers SingPay
                        services.req_NUM_AUTH(rid, sid, req.body.montant, description).then((dd) => {
                            //Le client a valide, on pocede au transfert de mob
                            services.updateStatusTrans(transID, constantes.state.SUCCESS).then(() => {
                                //On retourne au demandeur le status de la requette
                                var data = (req.body.data == undefined)? {} : req.body.data;
                                res.status(200).json({
                                    montant: req.body.montant,
                                    data: data
                                });
                            }).catch((err) => {
                                res.status(403).json(err);
                            })
                        }).catch((err) => {
                            console.log('ERR_REQ_NUM_AUTH:  '+err);
                            //On met le status a echec
                            services.updateStatusTrans(transID, constantes.state.ECHEC);
                            req.status(403).json({'error': 'autorization refused'});
                        })

                    }).catch((err) => {
                        console.log('ERR_TO_TR_INIT: '+err);
                        res.status(403).json(err);
                    });
                }
            }).catch((err) => {
                console.log('ERR_TO_TR_CHECK: '+err);
                res.status(403).json(err);
            })
            
        }).catch((err) => {
            //Return vers le serveur avec l erreur
            console.log("ERR_TR_INIT: "+err);
            res.status(400).json(err);
        });
        return;
        //var email = req.body.email;
        var name = req.body.name;
        var password = "1234546";
        console.log(req.body);
        //TODO verify pseudo length, mail rege, password etc.
        if(name == null){
            return res.status(400).json({'error': 'missing parameters'});
        }
        User.findOne({nom: "raphael2"}).then(function(userFound){
            if(!userFound){
                bcrypt.hash(password, 5, function(err, bcryptedPassword){
                    var newUser = User.create({
                        nom: name,
                        prenom: "PPPP",
                        mail: "mmmmmmmm",
                        tel: ["777"],
                        mdp: bcryptedPassword
                    }).then(function(newUser) {
                        return res.status(201).json({
                            'userId': newUser.id
                        });
                    }).catch(function(err){
                        return res.status(500).json({'error': 'cannot add user '+err});
                    })
                });
            }else{
                return res.status(409).json({'error': 'user already exist'});
            }
        }).catch(function(err){
            return res.status(500).json({'error': 'unable to verify user'});
        });

        


    },

    inform: function(req, res){
        var data = req.body;
        //console.log(data);
        //console.log('iiiiiiiiiiii2222222');
        for(var i= 0; i< data.length; i++){
            //On recupere le socket de l utilisateur
            var socket = req.uid_to_socket[data[i].uid];
            if(socket != undefined && socket != null){
                //L utilisateur est connecte, on lui envoi les info de la transaction
                socket.emit('new transaction', data[i].body);
            }
        }
        res.status(200).send("OK");
    },

    login: function(req, res){
        //Params
        var email = req.body.email;

        if(email == null){
            res.status(400).json({'error': 'missing parameters'});
        }
        var password = "1234546";
        User.findOne({mail: email}).then(function(userFound){
            if(userFound){
                bcrypt.compare(password, userFound.mdp, function(errBycrypt, resBycrypt){
                    if(resBycrypt){
                        return res.status(200).json({
                            'userId': userFound.id,
                            'token': jwtUtils.generateTokenForUser(userFound)
                        })
                    }else{
                        res.status(403).json({'error': 'invalid password'});
                    }
                })
            }else{
                res.status(404).json({'error': 'user not found in DB'});
            }
        }).catch(function(err){
            res.status(500).json({'error': 'unable to connect user  '+err})
        })
    }
}