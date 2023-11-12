var mongoose = require('mongoose');
const {Schema, model} = mongoose;

const ubalSchema = new Schema({
    _uid: String,
    mobbce: Int,
    waitbce: Int,
    createAt: String,
    updateAt: String
});

const UBalance = model("Ubalance", ubalSchema);

module.exports = UBalance;