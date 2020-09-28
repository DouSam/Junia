const express = require("express");
const router = express.Router({ mergeParams: true });
const Produto = require("../models/produto")

//Novo produto
router.get("/novo", (req, res) => {
    //Formulario de preenchimento novo produto
    res.render("../views/produto/novo")
})
//Criando o novo produto
router.post("/", (req, res) => {
    req.body.ctrEst = req.body.ctrEst ? true : false;
    Produto.create(req.body, (err) => {
        if (err) {
            console.log("produto.js err 1")
        } else {
            res.redirect("/produtos")
        }
    })
})
//Listando todos os produtos
router.get("", (req, res) => {
    req.query.nome = req.query.nome ? req.query.nome : "";
    Produto.find({ "nome": { $regex: '.*' + req.query.nome + '.*' } }, (err, produtos) => {
        if (err) {
            console.log("produto.js err 2");
        } else {
            res.render("../views/produto/produtos", { produtos: produtos });
        }
    })
})
//Buscando um produto em especifico
router.get("/:id", (req, res) => {
    Produto.findById(req.params.id, (err, produto) => {
        if (err) {
            console.log("produto.js err 3")
        } else {
            res.render("../views/produto/produto", { produto: produto })
        }
    })
})
//Deletando um produto
router.get("/:id/delete", (req, res) => {
    Produto.findOneAndDelete(req.params.id, (err) => {
        if (err) {
            console.log("produto.js err 4")
        } else {
            res.redirect("/produtos")
        }
    })
})
//Form para editar produto
router.get("/:id/edit", (req, res) => {
    Produto.findById(req.params.id, (err, produto) => {
        if (err) {
            console.log("produto.js err 5")
        } else {
            res.render("../views/produto/edit", { produto: produto })
        }
    })
})
//Editando o produto do form anterior
router.put("/:id", (req, res) => {
    Produto.findByIdAndUpdate(req.params.id, req.body, (err) => {
        if (err) {
            console.log("produto.js err 6")
        } else {
            res.redirect(`/produtos/${req.params.id}`)
        }
    })
})

module.exports = router;