const mongoose = require('mongoose');
const crypto = require('crypto');
const Service = require("../model/Service");
const User = require("../model/User");
const Transaction = require("../model/Transaction");
const constantes = require('./constantes');

exports.tr_check_modele = function(data){
    return new Promise((resolve, reject) => {
        var modele = "";
        
        //Verification de la presence des infos du sender
        if(data.snid == undefined && data.smid == undefined ){
            reject({'error': 'sender unknown'});
        }
        
        if(data.snid?.trim().length == 0 && data.smid?.trim().length == 0){
            reject({'error': 'sender unknown'});
        }
        
        if(data.snid == undefined && data.smid?.length == 0){
            reject({'error': 'sender unknown'});
        }else if(data.smid == undefined && data.snid?.length == 0){
            reject({'error': 'sender unknown'});
        }
        
        //On verifi que pas plus de 1 sender a ete renseigne
        if( data.snid?.length > 0 && data.smid?.length > 0 ){
            reject({'error': 'one sender waitted but two given'});
        }
        
        //On verifi le format du numero du client dans le cas ou le snum est fourni
        if(data.snid?.length > 0 && data.snid?.length != 8 ){
            reject({"error": "sender number is invalid"});
        }
        
        //On verifi le format du numero mob du client dans le cas ou le snum est fourni
        if(data.smid?.length > 0 && data.smid?.length != 8 ){
            reject({"error": "sender mob number is invalid"});
        }
        
        //On defini le le type de sender du modele
        if(data.snid?.length > 0){
            modele += "NUMBER_TO_";
        }else{
            modele += "MOB_TO_";
        }
        

        //Verification de la presence des infos du receiver
        if(data.rnid == undefined && data.rmid == undefined && data.rsid == undefined ){
            reject({'error': 'receiver unknown'});
        }
        if(data.rnid?.trim().length == 0 && data.rmid?.trim().length == 0 && data.rsid?.trim().length == 0){
            reject({'error': 'receiver unknown'});
        }
        
        if(data.rnid == undefined && data.rmid == undefined && data.rsid?.length == 0){
            reject({'error': 'receiver unknown'});
        }else if(data.rnid == undefined && data.rsid == undefined && data.rmid?.length == 0){
            reject({'error': 'receiver unknown'});
        }else if(data.rmid == undefined && data.rsid == undefined && data.rnid?.length == 0){
            reject({'error': 'receiver unknown'});
        }
        
        //On verifi que pas plus de 1 receiver a ete renseigne
        if( (data.rnid?.length > 0 && data.rmid?.length > 0) || (data.rnid?.length > 0 && data.rsid?.length > 0) || (data.rsid?.length > 0 && data.rmid?.length > 0) ){
            reject({'error': 'one receiver waitted but many given'});
        }
        //On verifi le format du numero du client dans le cas ou le rnid est fourni
        if(data.rnid?.length > 0 && data.rnid?.length != 8 ){
            reject({"error": "receiver number is invalid"});
        }
        //On verifi le format du numero mob du client dans le cas ou le rmid est fourni
        if(data.rmid?.length > 0 && data.rmid?.length != 8  ){
            reject({"error": "receiver mob number is invalid"});
        }
        //On verifi le format de l'id  du service dans le cas ou le rsid est fourni
        if (data.rsid?.length > 0 && !mongoose.Types.ObjectId.isValid(data.rsid)) {
            reject({"error": "receiver service id is invalid"});
        }
        //On defini le le type de receiver du modele
        if(data.rnid?.length > 0){
            modele += "NUMBER";
        }else if(data.rmid?.length > 0){
            modele += "MOB";
        }else{
            modele += "SERVICE";
        }

        //On verifi que le montant a ete defini
        if (typeof data.montant != 'number' && !(!isNaN(data.montant) && typeof data.montant === 'string')) {
            // La variable est de type nombre
            reject({'error': 'amount is unknown or in the wrong type'});
            return;
        } 
        if (!isNaN(data.montant) && typeof data.montant === 'string') {
            // La variable est une chaîne qui peut être convertie en nombre
            data.montant = parseInt(data.montant);
        }

        //On verifi si l'apiid est rensigne pour quadrants differents de NUMBER_TO_SERVICE et MOB_TO_SERVICE
        const Modeles = constantes.Modeles;
        if(modele != Modeles.NUMBER_TO_SERVICE && modele != Modeles.MOB_TO_SERVICE){
            if(data.apiid == undefined || data.apiid?.length == 0){
                reject({'error': 'apiid is unknown'})
            }
            if (data.apiid?.length > 0 && !mongoose.Types.ObjectId.isValid(data.apiid)) {
                reject({"error": "api id is invalid"});
            }
        }
        
        //On verifi si l'apikey est rensigne
        if(data.apikey == undefined || data.apikey?.trim().length == 0){
            reject({'error': 'apikey is unknown'})
        }
        resolve(modele);
        
    })
}



exports.tr_check_auth = function(ip, data, modele){
    //verification des parametres d authentification
    return new Promise(async (resolve, reject) => {
        try {
            
            //On verifi que seul l'ip local peut acceder aux 4 premieres fenetres du tableau RS
            if(constantes.Private_APP_modele.includes(modele) && ip != constantes.localIP){
                reject({'error': 'accès interdit'});
            }
            const Modeles = constantes.Modeles;
            if(modele == Modeles.NUMBER_TO_SERVICE || modele == Modeles.MOB_TO_SERVICE){
                //On verifi que le user qui en fait la demande est enregistre dans la bdd,
                var ser = await Service.findOne({_id: data.rsid});
                
                if(ser == null){
                    reject({'error': 'receiver service id is invalid'});
                    return;
                }
                //On verifi que le apikey est correcte
                if(!verifyApiKey(`ser${ip}vice`, ser._id.toString(), data.apikey)){
                    reject({'error': 'api key is invalid'});
                    return;
                }
                //On verifi que le smid est correcte si nous sommes dans le quadrant MOB_TO_SERVICE
                if(modele == Modeles.MOB_TO_SERVICE){
                    var res = await User.findOne({mid: data.smid});
                    if(res == null){
                        reject({'error': 'sender mobidic id is invalid'});
                        return;
                    }
                    //Tout est ok, authorisation accodee
                    resolve({rid: ser.uid.toString(), sid: res._id.toString()});
                    return;
                }else{
                    //Tout est ok, authorisation accodee
                    resolve({rid: ser.uid.toString()});
                    return;
                }
            }else if(modele == Modeles.MOB_TO_MOB){
                //On verifi que le user qui en fait la demande est enregistre dans la bdd,
                var user = await User.findOne({mid: data.smid});
                
                if(user == null){
                    reject({'error': 'sender mob id is invalid'});
                    return;
                }
                //On verifi que le api id est correcte
                if(user._id.toString() != data.apiid){
                    reject({'error': 'api id is invalid'});
                    return;
                }
                //On verifi que le apikey est correcte
                if(!verifyApiKey(`us${constantes.localIP}er`, user._id.toString(), data.apikey)){
                    reject({'error': 'api key is invalid'});
                    return;
                }
                //On verifi si le rmid est correcte
                var res = await User.findOne({mid: data.rmid});
                if(res == null){
                    reject({'error': 'receiver mobidic id is invalid'});
                    return;
                }
                //Tout est ok, authorisation accodee
                resolve({rid: res._id.toString(), sid: user._id.toString()});
                return;

            }else if(modele == Modeles.NUMBER_TO_MOB){
                //On verifi que le user qui en fait la demande est enregistre dans la bdd,
                var user = await User.findOne({mid: data.rmid});
                
                if(user == null){
                    reject({'error': 'receiver mob id is invalid'});
                    return;
                }

                //On verifi que le api id est correcte
                if(user._id.toString() != data.apiid){
                    reject({'error': 'api id is invalid'});
                    return;
                }

                //On verifi que le apikey est correcte
                if(!verifyApiKey(`us${constantes.localIP}er`, user._id.toString(), data.apikey)){
                    reject({'error': 'api key is invalid'});
                    return;
                }
                //Tout est ok, authorisation accodee
                resolve({rid: user._id.toString()});
                return;

            }else if(modele == Modeles.MOB_TO_NUMBER){
                //On verifi que le user qui en fait la demande est enregistre dans la bdd,
                var user = await User.findOne({mid: data.smid});
                
                if(user == null){
                    reject({'error': 'sender mob id is invalid'});
                    return;
                }
                //On verifi que le api id est correcte
                if(user._id.toString() != data.apiid){
                    reject({'error': 'api id is invalid'});
                    return;
                }
                //On verifi que le apikey est correcte
                if(!verifyApiKey(`us${constantes.localIP}er`, user._id.toString(), data.apikey)){
                    reject({'error': 'api key is invalid'});
                    return;
                }
                //Tout est ok, authorisation accodee
                resolve({sid: user._id.toString()});
                return;

            }else if(modele == Modeles.NUMBER_TO_NUMBER){
                //On verifi que le user qui en fait la demande est enregistre dans la bdd,
                var user = await User.findOne({_id: data.apiid});
                
                if(user == null){
                    reject({'error': 'api id is invalid'});
                    return;
                }
                //On verifi que le apikey est correcte
                if(!verifyApiKey(`us${constantes.localIP}er`, user._id.toString(), data.apikey)){
                    reject({'error': 'api key is invalid'});
                    return;
                }
                //Tout est ok, authorisation accodee
                resolve({sid: user._id.toString()});
                return;
            }
        } catch (error) {
            console.log("ERR_TR_CHECK_AUTH: "+error);
            reject({'error': 'unable to check your authentication'});
        }
    });

    //TODO: Requette vers la base de donnees pour verifier si le data.ssid et data.apikey existent et corresponde
}

exports.isUserEnoughtMOB = function(uid, montant){
    return new Promise(async (resolve, reject) => {
        var ut = await User.findOne({_id: new mongoose.Types.ObjectId(uid)});
        if(ut.balance > montant){
            resolve(true);
        }else{
            reject({'error': 'this user don t have enought mob'});
        }
    })
}

exports.transINIT = function(data, modele){
    return new Promise(async (resolve, reject) => {
        //On construit la transaction puis on l'enregistre
        var transaction = {};
        transaction.type = modele;
        transaction.snid = (data.snid?.length > 0)? data.snid : '';
        transaction.smid = (data.smid?.length > 0)? data.smid : '';
        transaction.rnid = (data.rnid?.length > 0)? data.rnid : '';
        transaction.rmid = (data.rmid?.length > 0)? data.rmid : '';
        transaction.rsid = (data.rsid?.length > 0)? data.rsid : '';
        transaction.montant = data.montant;
        transaction.total = data.montant;
        
        if(data.description?.length > 0){
            transaction.description = data.description;
        }else{
            transaction.description = `Payement de ${data.montant} xaf via Mobidyc`;
        }
        const tr = await Transaction.create(transaction);
        if(tr._id != undefined){
            //La transaction a bien ete enregistree
            resolve({transID: tr._id.toString(), description: transaction.description});
        }else{
            reject({'error': 'unable to save transaction'});
        }
    })
}

exports.incrementMOB = function(uid, mob){
    return new Promise(async (resolve, reject) => {
        await User.findByIdAndUpdate(new mongoose.Types.ObjectId(uid),
        {$inc: {balance: mob, updatedAt: new Date()}}).then((r) => {
            resolve(true);
        }).catch((err) => {
            console.log('ERR_ADD_MOB:  '+err);
            reject({'error': 'Unable to increment mob to this user'});
        })
    })
}

exports.decrementMOB = function(uid, mob){
    return new Promise(async (resolve, reject) => {
        await User.findByIdAndUpdate(new mongoose.Types.ObjectId(uid),
        {$inc: {balance: -mob, updatedAt: new Date()}}).then((r) => {
            resolve(true);
        }).catch((err) => {
            console.log(err);
            reject({'error': 'Unable to decrement mob to this user'});
        })
    
    })
}

exports.updateStatusTrans = function(transID, status){
    return new Promise(async (resolve, reject) => {
        await Transaction.findByIdAndUpdate(new mongoose.Types.ObjectId(transID),
        {state: status}).then((r) => {
            resolve(true);
        }).catch((err) => {
            reject({'error': 'Unable to update  the status of the transaction'});
        })
    })
}

exports.hhh = async function(Service) {
    var tt = await Service.findOne({nom: 'Service2'});
console.log(tt);
}
exports.fff = function(){
    console.log(createApiKey('us::1er', '654f36cd5a0a492d5f3ad61a'));
}
// Fonction pour créer une clé API
function createApiKey(apiKeySecret, data) {
    const hmac = crypto.createHmac('sha256', apiKeySecret);
    const signature = hmac.update(data).digest('hex');
    return signature;
}

// Fonction pour vérifier la validité d'une clé API
function verifyApiKey(apiKeySecret, data, receivedSignature) {
    const expectedSignature = createApiKey(apiKeySecret, data);
    return receivedSignature === expectedSignature;
}

exports.req_MOB_AUTH = function(uid, montant, description){
    return new Promise((resolve, reject) => {
        //On demande au client la permission de lui prendre des mob pour ce service

        //L APK n a pas encore ete dveloppe, on considere que le client a donnee sont autorisation
        resolve(true);
    })
}

exports.req_NUM_AUTH = function(rid, sid, montant, description){
    return new Promise((resolve, reject) => {
        //On envoi une requettte a sinpay 

        //L APK n a pas encore ete dveloppe, on considere que le client a donnee sont autorisation
        resolve(true);
    })
}