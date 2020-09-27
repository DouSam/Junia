var express    = require("express"),
    app        = express(),
    bodyParser = require('body-parser'),
    mongoose   = require("mongoose"),
    methodOverride = require("method-override"),
    flash      = require("connect-flash"),
    fs         = require('fs'),
    sys        = require('util');

var http = require('http').createServer(app);
var io   = require('socket.io')(http)

mongoose.connect("mongodb://127.0.0.1:27017/junia-lanches", { useNewUrlParser: true, useFindAndModify: false });
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));
app.locals.moment = require('moment');

app.use(require("express-session")({
    secret: 'a',
    resave: false,
    saveUninitialized: false
}));

app.use(flash());

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

var Cliente = require("./models/cliente"),
    Mesa = require("./models/mesa"),
    Produto = require("./models/produto")

//Rotas
var mesasRotas = require("./routes/mesas"),
    clientesRotas = require("./routes/cliente"),
    produtosRotas = require("./routes/produto"),
    comprasRotas = require("./routes/compra"),
    vendasRotas = require("./routes/venda")


//Usando as rotas
app.use("/mesas", mesasRotas)
app.use("/clientes", clientesRotas)
app.use("/produtos", produtosRotas)
app.use("/compras", comprasRotas)
app.use("/vendas", vendasRotas)

//Recebndo conexões do server
io.on('connection', (socket) => {
    socket.on("busca clientes",(nome)=>{
        Cliente.find({ "nome": { $regex: '.*' + nome.nome + '.*' } }, (err, clientes) => {
            if (err) {
                console.log("erro app.js->1\n", err)
            } else {
                socket.emit("retorna clientes", clientes)
            }
        })
    })

    socket.on('limpa mesa',(id)=>{
        Mesa.findByIdAndUpdate(id,{status:'livre'},(err)=>{
            if(err){
                console.log('erro app.js 2\n', err)
            }else{
                socket.emit('atualiza mesa')
            }
        })
    })

    socket.on('busca total venda',(produtos)=>{
        produtos.forEach((produto)=>{
            Produto.findById(produto.produto,(err,produtoE)=>{
                if(err){
                    console.log('erro app.js 3\n', err)
                }else{
                    socket.emit('soma total venda', produto.qtd * produtoE.val)
                }
            })
        })
    })
})

app.get("/",(req,res)=>{
    res.render("home")
})

http.listen(27015, () => {
    console.log('listening on 27015');
});