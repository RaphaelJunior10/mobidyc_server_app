var mongoose = require('mongoose');
const {Schema, model} = mongoose;

const userSchema = new Schema({
    nom: {
        type: String,
        require: true
    },
    prenom: {
        type: String,
        require: true
    },
    tel: {
        type: [String],
        required: true
    },
    mail: {
        type: String,
        minLength: 6,
        require: true,
    },
    mdp: {
        type: String,
        required: true
    },
    mid: {
        type: String,
        required: true
    },
    apikey: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        required: true,
        integer: true,
        default: () => 0
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

const User = model("User", userSchema);

module.exports = User;