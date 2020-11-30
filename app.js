//jshint esversion:6
const path = require('path')
require('dotenv').config({ path1: __dirname + "\.env" })
console.log(require('dotenv').config);
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

// console.log("SECRET " + process.env.SECRET);

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "email is manadatory"]
  },
  password: {
    type: String,
    required: [true, "content is required"]
  }
});

// const secret = process.env.SECRET;
//
// userSchema.plugin(encrypt, { secret: secret , encryptedFields: ['password'] });

const User = mongoose.model("User", userSchema);


app.get("/", function(req, res) {
  res.render("home");
}); //app.get("/", function(req,res) {

app.get("/login", function(req, res) {
  res.render("login");
}); //app.get("/login", function(req,res) {

app.get("/register", function(req, res) {
  res.render("register");
}); //app.get("/register", function(req,res) {

app.post("/register", function(req,res) {
  //console.log(req.body.username);
  const username = req.body.username;
  const password = req.body.password;


  bcrypt.hash(password, 10, function(err, hash) {
    // Store hash in database
    const userToInsert = new User({
      email: req.body.username,
      password: hash
    });
    userToInsert.save(function(err) {
          if (err) {
            res.send(err);
              } else {
          res.render("secrets");
          }
      });
  });





}); //app.post("/register", function(req,res) {

  app.post("/login", function(req,res){

    const username = req.body.username;
    var password = req.body.password;



    User.findOne({email: username }, function(err, foundUser) {
      if (err) {
    res.send(err);
    } else {
      if (foundUser){

        bcrypt.compare(password, foundUser.password, function(err, foundpassword) {
          // console.log(password + " " + foundUser.password );
    if(foundpassword) {
     // Passwords match
      res.render("secrets");
    } else {
     // Passwords don't match
     res.send("Invalid password!");
    }
  });
      }
    }
  });//User.findOne({email: username }, function(err, foundUser) {

  });//app.post("/login", function(req,res){







app.listen(3000, function() {
  console.log("Server started on port 3000");
});
