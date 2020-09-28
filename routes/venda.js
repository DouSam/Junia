const express = require("express");
const router = express.Router({ mergeParams: true });
const Comanda = require("../models/comanda")
const Produto = require("../models/produto")

//Listando todas as vendas
router.get("", (req, res) => {
    var dtHoje = new Date()
    var dtIni = req.query.dtIni != undefined ? req.query.dtIni : new Date(0, 1);
    var dtFim = req.query.dtFim != undefined ? req.query.dtFim : new Date(dtHoje.setFullYear(dtHoje.getFullYear() + 10));
    Comanda.find({ data: { $gte: dtIni, $lte: dtFim } }).populate("cliente").exec((err, comandas) => {
        if (err) {
            console.log("venda.js err 1");
        } else {
            res.render("../views/venda/vendas", { comandas: comandas });
        }
    })
})

//Exibindo contas dos clientes
router.get('/contas', (req, res) => {
    Comanda.find({ fechada: false }).populate('cliente').exec((err, comandas) => {
        if (err) {
            console.log("venda.js err 5\n", err)
        } else {
            res.render('../views/venda/contas', { comandas: comandas })
        }
    })
})

//Realizando o pagamento da conta
router.put('/:id/conta', (req,res)=>{
    var obj = {
        fechada:true,
        dataPg: Date.now(),
        modoPg : req.body.modoPg,
        valE: req.body.valE
    }
    Comanda.findByIdAndUpdate(req.params.id,obj,(err)=>{
        if(err){
            console.log(err)
        }else{
            res.redirect('/vendas/contas')
        }
    })
})

//Nova venda
router.get("/novo", (req, res) => {
    Comanda.countDocuments().exec((err, num) => {
        if (err) {
            console.log(err)
        } else {
            //Formulario de preenchimento nova venda
            Produto.find({}, (err, produtos) => {
                if (err) {
                    console.log("venda.js err 2.1\n", err)
                } else {
                    res.render("../views/venda/nova", { produtos: produtos, num:num })
                }
            })
        }
    })
})

//Listando uma venda especifica
router.get("/:id", (req, res) => {
    Comanda.findById(req.params.id).populate('produtos.produto cliente').exec((err, comanda) => {
        if (err) {
            console.log("venda.js err 2")
        } else {
            res.render("../views/venda/venda", { comanda: comanda })
        }
    })
})

//Criando a nova venda
router.post("/", (req, res) => {
    req.body.produtos = []
    if (Array.isArray(req.body.qtd)){
        req.body.produto.forEach((produto, i) => {
            Produto.findByIdAndUpdate(produto, { $inc: { qtdEst: -req.body.qtd[i] } }, (err) => {
                if (err) {
                    console.log("compra.js err 3.1", err)
                }
            })
            let objProduto = {
                produto: produto,
                qtd: req.body.qtd[i]
            }
            req.body.produtos.push(objProduto)
        })
    }else{
        req.body.produtos = [
            {
                produto: req.body.produto,
                qtd: req.body.qtd
            }
        ]
        Produto.findByIdAndUpdate(req.body.produto, { $inc: { qtdEst: -req.body.qtd } }, (err) => {
            if (err) {
                console.log("compra.js err 3.2")
            }
        })
    }
    req.body.fechada = req.body.modoPg == 'conta' ? false : true
    req.body.data = Date.now()
    req.body.dataPg = new Date(1)
    req.body.delivery = req.body.delivery = 'on' ? true : false 
    Comanda.create(req.body, (err) => {
        if (err) {
            console.log("venda.js err 3")
        } else {
            res.redirect("/vendas")
        }
    })
})

//Deletando um deletando uma venda
router.get("/:id/delete", (req, res) => {
    Comanda.findByIdAndDelete(req.params.id, (err, comanda) => {
        if (err) {
            console.log("venda.js err 4")
        } else {
            comanda.produtos.forEach((produto) => {
                Produto.findByIdAndUpdate(produto.produto, { $inc: { qtdEst: produto.qtd } }, (err) => {
                    if (err) {
                        console.log("venda.js err 4.1")
                    }
                })
            })
            res.redirect("/vendas")
        }
    })
})

module.exports = router;