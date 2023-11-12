//Imports
var bcrypt = require('bcrypt');
var jwtUtils = require('../utils/jwt.utils');
var User = require('../model/User');

//Routes
module.exports = {
    register: function(req, res){
        console.log('register');
        //Params
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
    login: function(req, res){
        const origin = req.get('Origin') || req.get('Referer');
        console.log(origin);
        return;
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