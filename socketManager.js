
const User = require("./model/User");
const Service = require("./model/Service");
const Transaction = require("./model/Transaction");
var service = require('./modules/services');
const constantes = require('./modules/constantes');
const bcrypt = require('bcrypt');

const socketManager = (io, uid_to_socket,  socket_id_to_uid) => {
    //var uid_to_socket = {};
    //var socket_id_to_uid = {};
    // Gestionnaire de connexion Socket.IO
    io.use(async (socket, next) => {
        console.log('uuuuuuuu');
        // Accédez aux données du client depuis la requête
        const mail = socket.handshake.query.mail;
        const mdp = socket.handshake.query.mdp;
        console.log(mail, mdp);
        console.log(socket.handshake.query);
        console.log('111');
        
        var user = await User.findOne({mail: mail});
        console.log(socket.uid);
        //console.log(await bcrypt.compare(mdp, user.mdp));
        console.log('222');
        if (!user){
            console.log('user checking failed');
            return next(new Error('Nom d\'utilisateur manquant'));
        }
        var verifMdp = await bcrypt.compare(mdp, user.mdp);
        if (!verifMdp){
            console.log('user checking failed');
            return next(new Error('Nom d\'utilisateur manquant'));
        }
        socket.uid = user._id.toString();
        socket.user = user;
        console.log(user._id);
        next();
    });
    io.on('connect', (socket) => {
        console.log('Nouvelle connexion Socket.IO  '+socket.id+'  '+socket.uid);
        //On enregistre le client dans la table uid_to_socket et socket_id_to_uid
        uid_to_socket[socket.uid] = socket;
        socket_id_to_uid[socket.id] = socket.uid;
        socket.on('get-all-infos', async (data, callback) => {
            console.log('le client demande toutes ses infos');
        
            var user = socket.user;
            var uid = socket_id_to_uid[socket.id];
            service.get_all_infos(uid).then((data) => {
                //On envoi au client toutes les infos
                console.log('On envoi au client toutes les infos');
                console.log('infos:  '+new Date().getSeconds());
                console.log(data['serObj']);
                callback(data);
            }).catch((err) => {
                console.log(err);
                console.log('ERR_GET_ALL_INFOS: '+err);
                callback({
                    user: [],
                    services: [],
                    transactions: [],
                    serObj: {}
                 });
            });
        });

        /*socket.emit('new transaction', {
            montant: 2000,
            rid: '074793585',
            increment: true
        });*/

        /*socket.emit('get_auth', {
            rid: 'rid',
            montant: 5000,
            frais: 10
        }, (response) => {
          console.log(response);
          console.log('une response');
        });*/
    
        socket.on('number_to_mob', async (data, callback) => {
            console.log('Un number to mob');
            /*console.log(data);
            callback({
                status: 200,
                data: {'tt': 'uu'}
            });
            return;*/
            console.log('le client demande  a faire un number to mob');
            console.log(data.snid);
            console.log(service.findTransfertHome(data.snid));
            //On verii que les variables ont ete defini et sont correcte
            if(data.snid == undefined || service.findTransfertHome(data.snid) == constantes.transferHOME.NONE){
                callback({
                    status: 400,
                    error: 'sender number id is invalid'
                });
                return;
            }
            if(data.rmid == undefined || data.rmid?.length != 8){
                callback({
                    status: 401,
                    error: 'receiver mob id is invalid'
                });
                return;
            }
            if(data.montant == undefined || data.montant < 100){
                callback({
                    status: 310,
                    error: 'Amount is unknown or is lower than 100'
                });
                return;
            }
            var uid = socket_id_to_uid[socket.id];
            service.number_to_mob(data.snid, data.rmid, uid, data.montant).then((data) => {
                
                callback({
                    status: 200,
                    data: data
                });
            }).catch((err) => {
                console.log(err);
                console.log('ERR_NUMBER_TO_MOB: '+err);
                callback({
                    status: err.status,
                    error: err.error
                 });
            });
        });

        socket.on('mob_to_mob', async (data, callback) => {
            //console.log('le client demande  a faire un mob to mob');
            //console.log('infos2:  '+new Date().getSeconds());
            //console.log('.....................................................................');
            //On verii que les variables ont ete defini et sont correcte
            console.log(data);
            if(data.rmid == undefined || data.rmid?.length != 8){
                callback({
                    status: 402,
                    error: 'receiver mob id is invalid'
                });
                return;
            }
            if(data.montant == undefined || data.montant < 100){
                callback({
                    status: 407,
                    error: 'Amount is unknown or is lower than 100'
                });
                return;
            }
            var uid = socket_id_to_uid[socket.id];
            service.mob_to_mob(data.rmid, uid, data.montant).then((data) => {
                //On envoi au client toutes 0213666666666669les infos
                console.log('mob:  '+new Date().getSeconds());
                callback({
                    status: 200,
                    data: data
                });
            }).catch((err) => {
                console.log('ERR_MOB_TO_MOB: '+err);
                callback({
                    status: err.status,
                    error: err.error
                 });
            });
        });

        socket.on('mob_to_number', async (data, callback) => {
            console.log('le client demande  a faire un mob to number');
            //On verii que les variables ont ete defini et sont correcte
            
            if(data.rnid == undefined){
                callback({
                    status: 406,
                    error: 'receiver number id is invalid'
                });
                return;
            }
            if(data.montant == undefined || data.montant < 100){
                callback({
                    status: 407,
                    error: 'Amount is unknown or is lower than 100'
                });
                return;
            }
            var uid = socket_id_to_uid[socket.id];
            service.mob_to_number(data.rnid, uid, data.montant).then((data) => {
                //On envoi au client toutes les infos
                callback({
                    status: 200,
                    data: data
                });
            }).catch((err) => {
                console.log('ERR_MOB_TO_MOB: '+err);
                callback({
                    status: err.status,
                    error: err.error
                 });
            });
        });

        socket.on('number_to_number', async (data, callback) => {
            console.log('le client demande  a faire un number to number');
            //On verii que les variables ont ete defini et sont correcte
            if(data.snid == undefined || data.snid?.length != 8){
                callback({
                    status: 403,
                    error: 'sender number id is invalid'
                });
                return;
            }
            if(data.rnid == undefined || data.rnid?.length != 8){
                callback({
                    status: 403,
                    error: 'receiver number id is invalid'
                });
                return;
            }
            if(data.montant == undefined || data.montant < 100){
                callback({
                    status: 403,
                    error: 'Amount is unknown or is lower than 100'
                });
                return;
            }
            var uid = socket_id_to_uid[socket.id];
            service.number_to_number(daa.snid, data.rnid, uid, data.montant).then((data) => {
                //On envoi au client toutes les infos
                callback({
                    status: 200,
                    data: data
                });
            }).catch((err) => {
                console.log('ERR_MOB_TO_MOB: '+err);
                callback({
                    status: 403,
                    error: err
                 });
            });
        });

        socket.on('disconnect', () => {
            console.log('Le client s\'est déconnecté');
            //On supprime le client des listes uid_to_socket
            var uid = socket_id_to_uid[socket.id];
            if (uid_to_socket.hasOwnProperty(uid)) {
                delete uid_to_socket[uid];
                console.log(uid_to_socket);
            }
            socket = null;
        });
        
    });
}

module.exports = socketManager;
