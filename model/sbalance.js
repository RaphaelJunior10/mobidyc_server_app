var mongoose = require('mongoose');
const {Schema, model} = mongoose;

const sbalSchema = new Schema({
    _sid: String,
    mobbce: Int,
    waitbce: Int,
    createAt: String,
    updateAt: String
});

const SBalance = model("Sbalance", sbalSchema);

module.exports = SBalance;