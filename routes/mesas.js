const express = require("express");
const router = express.Router({ mergeParams: true });
const Mesa = require("../models/mesa")
const Comanda = require("../models/comanda")
const Produto = require("../models/produto")

//Nova mesa
router.get("/novo", (req, res) => {
    //Formulario de preenchimento nova mesa
    res.render("../views/mesas/nova")
})
//Criando a nova mesa
router.post("/", (req,res)=>{
    req.body.status = "livre";
    Mesa.create(req.body,(err)=>{
        if(err){
            console.log("mesas.js err 1")
        }else{
            res.redirect("/mesas")
        }
    })
})
//Listando todas as mesas
router.get("", (req,res)=>{
    Mesa.find({}).populate("cliente").exec((err,mesas)=>{
        if(err){
            console.log("mesas.js err 2");
        }else{
            res.render("../views/mesas/mesas",{mesas:mesas});
        }
    })
})

//Listando uma mesa especifica
router.get("/:id",(req,res)=>{
    Mesa.findById(req.params.id).populate({path:'comanda',populate:{path:'produtos.produto'}}).populate('cliente').exec((err,mesa)=>{
        if(err){
            console.log("mesas.js err 3")
        }else{
            res.render("../views/mesas/mesa", { mesa: mesa})
        }
    })
})

//Update da mesa para inserir o cliente
router.put("/:id",(req,res)=>{
    if(req.body.op == 'adcP'){
        var objProduto = {
            produto : req.body.produto,
            qtd : req.body.qtd
        }
        Comanda.findByIdAndUpdate(req.body.comanda,{$push:{produtos:objProduto}},(err,comanda)=>{
            if(err){
                console.log("mesas.js err 4")
            }else{
                Produto.findByIdAndUpdate(req.body.produto,{$inc:{qtdEst:-objProduto.qtd}},{new:true},(err,produto)=>{
                    if(err){
                        console.log('mesas.js err 4.1')
                    }else{
                        if(produto.ctrEst && (produto.qtdEst < produto.altEst)){
                            req.flash("error", "Alerta de estoque acionado, por favor verificar produto " + produto.nome);
                        }
                        res.redirect(`/mesas/${req.params.id}`)
                    }
                })
            }
        })
    }else{
        Comanda.countDocuments().exec((err,num)=>{
            if(err){
                console.log(err)
            }else{
                var comanda = {
                    data: Date.now(),
                    num: num + 1
                }
                Comanda.create(comanda, (err, comanda) => {
                    if (err) {
                        console.log("mesas.js err 4.1\n", err)
                    } else {
                        var mesa = {
                            comanda: comanda,
                            status: 'ocupada',
                            cliente: req.body.id
                        }
                        Mesa.findByIdAndUpdate(req.params.id, mesa, (err, mesa) => {
                            if (err) {
                                console.log("mesas.js err 5")
                            } else {
                                res.redirect(`/mesas/${req.params.id}`)
                            }
                        })
                    }
                })
            }
        })
    }
})

//Form para adicionar produto
router.get("/:id/adicionarProduto",(req,res)=>{
    Mesa.findById(req.params.id,(err,mesa)=>{
        if(err){
            console.log("mesas.js err 6")
        }else{
            Produto.find({}, (err, produtos) => {
                if (err) {
                    console.log("mesas.js err 6")
                } else {
                    res.render("../views/mesas/adcProduto", { mesa: req.params.id, produtos: produtos, comanda:mesa.comanda })
                }
            })
        }
    })
})

//Fechar comanda
router.get('/:id/fecharComanda',(req,res)=>{
    Mesa.findById(req.params.id).populate({ path: 'comanda', populate: { path: 'produtos.produto' } }).populate('cliente').exec((err, mesa) => {
        if (err) {
            console.log("mesas.js err 7")
        } else {
            res.render("../views/mesas/fechaComanda", { mesa: mesa })
        }
    })
})

//Fechando a comanda
router.put('/:id/fecharComanda', (req, res) => {
    Mesa.findByIdAndUpdate(req.params.id, { cliente: null, comanda: null, status: 'suja' }, (err, mesa) => {
        if (err) {
            console.log("mesas.js err 8 ", err)
        } else {
            var fechada = req.body.modoPg == 'conta' ? false:true;
            var dataPg = new Date(1);        
            Comanda.findByIdAndUpdate(mesa.comanda, {
                fechada: fechada,
                dataPg: dataPg,
                modoPg: req.body.modoPg,
                valE: req.body.valE,
                delivery: false,
                cliente:mesa.cliente,
                valT : req.body.valT
            },(err,comanda)=>{
                if(err){
                    console.log("mesas.js err 9")
                }else{
                    res.redirect(`/mesas/${req.params.id}`)
                }
            })
        }
    })
})

module.exports = router;