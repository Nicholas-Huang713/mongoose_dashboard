var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var flash = require('express-flash');
var moment = require("moment");
mongoose.Promise = global.Promise;

app.use(express.static(__dirname + "/static"));
app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: "quotes",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
  }))

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

mongoose.connect('mongodb://localhost/dashboard');
var AnimalSchema = new mongoose.Schema({
    name: {type: String, required: [true, "name must be longer than 3 characters"], minlength: 3},
    animal: {type: String, required: [true, "animal name must be longer than 3 characters"], minlength: 3},
})
mongoose.model("Animal", AnimalSchema);
var Animal = mongoose.model("Animal");

app.get('/', function(req,res){
    Animal.find({}, (err, animals)=>{
        if(err){
            console.log("Error:", err);
            res.render('index');
        } else{
            console.log(animals);
            res.render('index', {animals})
        }
    }) 
})

app.get('/mongooses/new', function(req,res){
    res.render("new_animal")
})

app.post('/mongooses', function(req,res){
    console.log(req.body);
    const animal = new Animal({
        name: req.body.name,
        animal: req.body.animal
    })
    animal.save(err=>{
        if(err){
            console.log('Error: ' , err);
            for(let key in err.errors){
                req.flash('validation', err.errors[key].message);
            }
            res.redirect('/mongooses/new');
        } else{
            console.log("success!");
            res.redirect('/');
        }
    })
})

app.get('/mongooses/:id', function(req,res){
    console.log(req.params.id);
    Animal.findOne({_id: req.params.id}, (err, animals)=>{
        if(err){
            console.log("There is an error");
            res.render('edit');
        } else{
            console.log("successfully retrieved animal");
            console.log('animal: ', animals);
            res.render('show_animal', {animals});
        }
    })
})

app.get('/mongooses/edit/:id', function(req,res){
    console.log(req.params.id);
    Animal.findOne({_id: req.params.id}, (err, animals)=>{
        if(err){
            console.log("Error ", err);
            res.render('edit');
        } else{
            console.log("Animal: ", animals);
            res.render('edit', {animals});
        }
    })
})

app.post('/mongooses/:id', function(req,res){
    console.log(req.params.id);
    Animal.findOne({_id:req.params.id}, (err, animals)=>{
        if(err){
            for(let key in err.errors){
            req.flash('validation', err.errors[key].message);
            } 
        res.redirect('/');
        } else{
            Animal.update({_id: animals._id}, {$set: {name: req.body.name, animal: req.body.animal}}, function(err){
                if(err){
                    console.log('Error: ', err);
                    res.redirect(`/mongooses/${req.params.id}`);
                }else{
                    console.log(animals)
                    res.redirect(`/mongooses/${req.params.id}`);
                }
            })
            // animals.name = req.body.name;
            // animals.animal = req.body.animal;
            // animals.save(err=>{
                
            // }) 
        }
    })
})

app.post('/mongooses/destroy/:id',function(req,res){
    console.log(req.params.id)
    Animal.remove({_id: req.params.id}, err=>{
        if(err){
            console.log("there is an error");
            res.redirect(`/mongooses/${req.params.id}`);
        } else{
            console.log("successfully deleted animal");
            res.redirect('/')
        }
    })
})

app.listen(8000, function() {
    console.log("listening on port 8000");
})


