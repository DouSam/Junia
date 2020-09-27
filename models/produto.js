var mongoose = require("mongoose");

var ProdutoSchema = new mongoose.Schema({
    nome: String,
    ctrEst: Boolean,
    val: Number,
    qtdEst: Number,
    altEst: Number
});


module.exports = mongoose.model("Produto", ProdutoSchema);