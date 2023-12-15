var services = require('../modules/services');
const constantes = require('../modules/constantes');
var User = require('../model/User');
const { default: mongoose } = require('mongoose');

module.exports = {
    get_auth: async function(req, res){
        //Mobidyc a besoin q un user autorise une trasfert de mob
        //On verifi que les variables smid, rid, montant et frais sont bien defini
        if(req.body.rid == undefined || req.body.rid?.length == 0){
            res.status(400).json({'error': 'rid is unknown'});
            return;
        }
        if(req.body.montant == undefined || req.body.montant == 0){
            res.status(400).json({'error': 'amount is unknown or less than 0'});
            return;
        }
        if(req.body.frais == undefined){
            res.status(400).json({'error': 'frais is unknown'});
            return;
        }

        if(req.body.uid == undefined || !mongoose.Types.ObjectId.isValid(req.body.uid)){
            res.status(400).json({'error': 'uid is unknown or invalid'});
            return;
        }

        //On verifi que le user existe avant de lui faire la demande de transfert
        const user = await User.findOne({_id: req.body.uid});
        if(!user){
            res.status(400).json({'error': 'uid is invalid'});
            return;
        }

        //On verifi si le user en question est connecte
        if(req.uid_to_socket[user._id.toString()] == undefined){
            res.status(300).json({'error': 'user is not connected'});
            return;
        }

        //On lance de processus de demande de persmission
        services.get_auth(req.body.rid, req.uid_to_socket[user._id.toString()], req.body.montant, req.body.frais).then((response) => {
            console.log('response...');
            console.log(response);
            res.status(200).json(response);
        }).catch((err) => {
            console.log('ERR_GET_AUTH: '+err);
            res.status(400).json(err);
        })

    }
}