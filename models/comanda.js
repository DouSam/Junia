var mongoose = require("mongoose");

var ComandaSchema = new mongoose.Schema({
    produtos: [{
        produto : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Produto"
        },
        qtd : Number
    }],
    fechada : Boolean,
    valT : Number,
    data : Date,
    delivery : Boolean,
    dataPg : Date,
    num : Number,
    valE : Number,
    modoPg: String,
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cliente"
    },
    obs : String
});


module.exports = mongoose.model("Comanda", ComandaSchema);