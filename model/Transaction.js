var mongoose = require('mongoose');
const {Schema, model} = mongoose;

const TransSchema = new Schema({
    type: {
        type: String,
        required: true
    },
    snid: String,
    smid: String,
    rnid: String,
    rmid: String,
    rsid: String,
    montant: {
        type: Number,
        required: true,
        integer: true
    },
    frais: {
        type: Number,
        required: true,
        integer: true,
        default: () => 0
    },
    total: {
        type: Number,
        required: true,
        integer: true,
    },
    state: {
        type: String,
        required: true,
        default: () => "INIT"
    },
    description: {
        type: String,
        default: () => "Paiement via Mobidyc"
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

const Trans = model("Transaction", TransSchema);

module.exports = Trans;