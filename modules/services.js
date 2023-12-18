const mongoose = require('mongoose');
const crypto = require('crypto');
const Service = require("../model/Service");
const User = require("../model/User");
const Transaction = require("../model/Transaction");
const constantes = require('./constantes');
const axios =  require('axios');

exports.get_all_infos = function(uid){
    return new Promise(async (resolve, reject) => {
        try {
            //On recupere les infos du user
            var user = await User.findOne({_id: uid});
            //On recupere les infos sur ses services
            var ser = await Service.find({uid: user._id.toString()});
            
            var allSer = await Service.find();
            serObj = {};
            for(var j=0;j<allSer?.length;j++){
                serObj[allSer[j]._id.toString()] = allSer[j].nom;
            }
            //On recupere les infos des transactions
            var tel = user.tel;
            var mid = user.mid;
            var serList = [];
            for(var i=0;i<ser?.length;i++){
                serList.push(ser[i]._id.toString());
            }
            var trans = await Transaction.find({
            $or: [
                { snid: { $in: tel } },
                { smid: mid },
                { rnid: { $in: tel } },
                { rmid: mid },
                { rsid: { $in: serList } },
            ],
            });
            resolve({
                user: user,
                services: ser,
                transactions: trans,
                serObj: serObj
            });

        } catch (error) {
            reject({'error': 'unable to get all data to this user'});
        }
    });
}

exports.number_to_mob = function(snid, rmid, uid, montant){
    return new Promise(async (resolve, reject) => {
        //On verifi que le rmid est correcte
        var user = await User.findOne({mid: rmid});
        if(!user){
            reject({'status': 401, 'error': 'rmid is unknown'});
            return;
        }
        //On verifi que le snid est correcte
        if(findTransfertHome(snid) == constantes.transferHOME.NONE){
            reject({'status': 400, 'error': 'snid is invalid'});
            return;
        }
        //On construit la requette vers l api
        const apiid = uid;
        const apikey = createApiKey(`us${constantes.localIP}er`, uid);
        //console.log(apikey);
        axios.post(`${constantes.addrMobidycAPI}trans/init`,{
            snid: snid,
            rmid, rmid,
            apiid: apiid,
            apikey: apikey,
            montant: montant,
            data: {}
        }).then(function(response) {
            //console.log(response.data);
            //console.log('okokokkkokok');
            resolve(response.data);
        }).catch((err) => {
            var status = (err.response?.status != undefined)? err.response?.status : 501;
            var data = (err.response?.data != undefined)? err.response?.data : "Internal Error"; 
            console.log('ERR_AXIOS_1: '+data);
            
            reject({'status': status, 'error': data});
            return;
        });

    });
}


exports.mob_to_mob = function( rmid, uid, montant){
    return new Promise(async (resolve, reject) => {
        //On verifi que le rmid est correcte
        var user = await User.findOne({mid: rmid});
        if(!user){
            reject({status: 402, 'error': 'rmid is unknown'});
            return;
        }
        var user2 = await User.findOne({_id: uid});
        var smid = user2.mid;
        //On construit la requette vers l api
        const apiid = uid;
        const apikey = createApiKey(`us${constantes.localIP}er`, uid);
        axios.post(`${constantes.addrMobidycAPI}trans/init`,{
            smid: smid,
            rmid, rmid,
            apiid: apiid,
            apikey: apikey,
            montant: montant,
            data: {}
        }).then(function(response) {
            //console.log(response.data);
            //console.log('okokokkkokok');
            resolve(response.data);
        }).catch((err) => {
            console.log(err);
            console.log('ERR_AXIOS_2: '+err.response?.data);
            reject({'status': err.response?.status, 'error': 'Une erreur s est produite'});
            return;
        })

    });
}


exports.mob_to_number = function( rnid, uid, montant){
    return new Promise(async (resolve, reject) => {
        var user = await User.findOne({_id: uid});
        var smid = user.mid;
        //On construit la requette vers l api
        const apiid = uid;
        const apikey = createApiKey(`us${constantes.localIP}er`, uid);
        axios.post(`${constantes.addrMobidycAPI}trans/init`,{
            smid: smid,
            rnid, rnid,
            apiid: apiid,
            apikey: apikey,
            montant: montant,
            data: {}
        }).then(function(response) {
            //console.log(response.data);
            //console.log('okokokkkokok');
            resolve(response.data);
        }).catch((err) => {
            console.log(err);
            console.log('ERR_AXIOS_3: '+err.response?.data);
            reject({'status': err.response?.status, 'error': err.response?.data});
            return;
        })

    });
}


exports.number_to_number = function(snid, rnid, uid, montant){
    return new Promise(async (resolve, reject) => {
        var user = await User.findOne({_id: uid});
        //On construit la requette vers l api
        const apiid = uid;
        const apikey = createApiKey(`us${constantes.localIP}er`, uid);
        axios.post(`${constantes.addrMobidycAPI}trans/init`,{
            snid: snid,
            rnid, rnid,
            apiid: apiid,
            apikey: apikey,
            montant: montant,
            data: {}
        }).then(function(response) {
            //console.log(response.data);
            //console.log('okokokkkokok');
            resolve(response.data);
        }).catch((err) => {
            console.log('ERR_AXIOS_3: '+err.response.data);
            reject({'error': err.response.data});
            return;
        })

    });
}


// Fonction pour créer une clé API
function createApiKey(apiKeySecret, data) {
    const hmac = crypto.createHmac('sha256', apiKeySecret);
    const signature = hmac.update(data).digest('hex');
    return signature;
}


function findTransfertHome(numero) {
    // Expression régulière pour le format attendu
    const regexAM = /^(077|074)\d{6}$/;
    const regexMM = /^(066|062)\d{6}$/;
  
    // Test de la correspondance avec les deux catégories
    if (regexAM.test(numero)) {
      return constantes.transferHOME.AIRTEL_MONEY;
    } else if (regexMM.test(numero)) {
      return constantes.transferHOME.MOOV_MONEY;
    } else {
      return constantes.transferHOME.NONE;
    }
  }
exports.findTransfertHome = findTransfertHome;

exports.get_auth = function(rid, socket, montant, frais){
    return new Promise((resolve, reject) => {
        try {
            console.log('On attend la reponse du client');
            socket.emit('get_auth', {
                rid: rid,
                montant: montant,
                frais: frais
            }, (response) => {
              resolve(response);
            });
        } catch (error) {
            console.log(error);
            console.log('UNE ERREUR');
            reject({'error': 'permission denied'});   
        }
    });
}


exports.confirmToken = function(email, link){
    return new Promise((resolve, reject) => {
        const informationsToken = verifierTokenExpiration1h(link, email);
        if (informationsToken) {
            resolve(true);
            // Le token est valide, vous pouvez utiliser les informations extraites
            // pour identifier l'utilisateur et réinitialiser le mot de passe
            // par exemple : informationsToken.userId pour identifier l'utilisateur.
        } else {
        // Le token est invalide ou a expiré, affichez un message approprié à l'utilisateur
            console.log('Le lien a expiré ou est invalide.');
            reject(false);
        }
    })
}

function verifierTokenExpiration1h(token, secretKey) {
    const jwt = require('jsonwebtoken');
    try {
      // Vérifier le token
      const decoded = jwt.verify(token, secretKey);
      console.log('Token valide, décodé : ', decoded);
      return decoded; // Retourne les informations extraites du token si celui-ci est valide
    } catch (error) {
      // Le token est invalide ou expiré
      console.error('Token invalide : ', error);
      return null;
    }
}

exports.resetPassordDo = async function(email, mdp){
    return new Promise((resolve, reject) => {
        var bcrypt = require('bcrypt');
        //const crypto = require('crypto');
        //var hash = crypto.createHash('sha256');
        //var pass = hash.update(mdp).digest('hex');
        bcrypt.hash(mdp, 5, async function(err, bcryptedPassword){
            //console.log(bcryptedPassword);
            //console.log(email);
            await User.updateOne({mail: email}, {
                $set: {mdp: bcryptedPassword}
            });
            resolve(true);
        });
        
        
    });
   
}


exports.confirmEmail = function(email){
    return new Promise(async (resolve, reject) => {
        console.log(email);
        await User.updateOne(
            {mail: email},
            {$set:{verified: true}}
        );
        resolve(true);
    })
}