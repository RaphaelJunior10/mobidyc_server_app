var mongoose = require('mongoose');
const {Schema, model} = mongoose;

const serviceSchema = new Schema({
    uid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    nom: {
        type: String,
        required: true
    },
    serveur: {
        type: String,
        default: () => ""
    },
    callback: {
        type: String,
        default: () => ""
    },
    description: {
        type: String,
        default: () => "Un service de Mobidyc"
    },
    apikey: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: () => Date.now(),
        immutable: true
    },
    updatedAt: {
        type: Date,
        default: () => Date.now(),
        immutable: true
    },
});

const Service = model("Service", serviceSchema);

module.exports = Service;