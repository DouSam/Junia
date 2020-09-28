const express = require("express");
const router = express.Router({ mergeParams: true });
const Cliente = require("../models/cliente")

//Novo cliente
router.get("/novo", (req, res) => {
    //Formulario de preenchimento novo cliente
    res.render("../views/cliente/novo")
})
//Criando o novo cliente
router.post("/", (req, res) => {
    Cliente.create(req.body, (err) => {
        if (err) {
            console.log("cliente.js err 1")
        } else {
            res.redirect("/clientes")
        }
    })
})
//Listando todos os clientes
router.get("", (req, res) => {
    req.query.nome = req.query.nome ? req.query.nome : "";
    Cliente.find({ "nome": { $regex: '.*' + req.query.nome + '.*' } },(err, clientes) => {
        if (err) {
            console.log("cliente.js err 2");
        } else {
            res.render("../views/cliente/clientes", { clientes: clientes });
        }
    })
})
//Buscando um cliente em especifico
router.get("/:id",(req,res)=>{
    Cliente.findById(req.params.id,(err,cliente)=>{
        if(err){
            console.log("cliente.js err 3")
        }else{
            res.render("../views/cliente/cliente",{cliente:cliente})
        }
    })
})
//Deletando um cliente
router.get("/:id/delete",(req,res)=>{
    Cliente.findOneAndDelete(req.params.id,(err)=>{
        if(err){
            console.log("cliente.js err 4")
        }else{
            res.redirect("/clientes")
        }
    })
})
//Form para editar cliente
router.get("/:id/edit",(req,res)=>{
    Cliente.findById(req.params.id,(err,cliente)=>{
        if(err){
            console.log("cliente.js err 5")
        }else{
            res.render("../views/cliente/edit", {cliente:cliente})
        }
    })
})
//Editando o cliente do form anterior
router.put("/:id",(req,res)=>{
    Cliente.findByIdAndUpdate(req.params.id,req.body,(err)=>{
        if(err){
            console.log("cliente.js err 6")
        }else{
            res.redirect(`/clientes/${req.params.id}`)
        }
    })
})

module.exports = router;