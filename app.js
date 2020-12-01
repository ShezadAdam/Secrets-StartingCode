//jshint esversion:6
const path = require('path')
require('dotenv').config({
  path1: __dirname + "\.env"
})
console.log(require('dotenv').config);
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});

const userSchema = new mongoose.Schema({
  username: {
    type: String
    // required: [true, "email is manadatory"]
  },
  password: {
    type: String
    // required: [true, "content is required"]
  }
});

userSchema.plugin(passportLocalMongoose);

// const secret = process.env.SECRET;
//
// userSchema.plugin(encrypt, { secret: secret , encryptedFields: ['password'] });

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function(req, res) {
  res.render("home");
}); //app.get("/", function(req,res) {

app.get("/login", function(req, res) {
  res.render("login");
}); //app.get("/login", function(req,res) {

app.get("/register", function(req, res) {
  res.render("register");
}); //app.get("/register", function(req,res) {

app.get("/secrets", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});


app.post("/register", function(req, res) {

  User.register({
    username: req.body.username
  }, req.body.password, function(err, registeredUser) {

    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/secrets");
      })
    }
  });

}); //app.post("/register", function(req,res) {

app.post("/login", function(req, res) {

  if (!req.body.username) {
    res.json({
      success: false,
      message: "Username was not given"
    })
  } else {
    if (!req.body.password) {
      res.json({
        success: false,
        message: "Password was not given"
      })
    } else {

      const newLoginUser = new User({
        usrname: req.body.username,
        password: req.body.password
      });

      passport.serializeUser(function(newLoginUser, done) {
        done(null, newLoginUser);
      });

      passport.deserializeUser(function(newLoginUser, done) {
        done(null, newLoginUser);
      });

      req.login(newLoginUser, function(err) {

        if (err) {
          console.log(err);
          res.json({
            success: false,
            message: err
          });
        } else {
          passport.authenticate("local")(req, res, function() {
            res.redirect("/secrets");
          })
        }

      }); //req.login(newLoginUser, function(err){
    }
  } //if(!req.body.username){
}); //app.post("/login", function(req,res){


  app.get('/logout', function(req, res){
    req.logout();
    res.redirect("/");
  });




app.listen(3000, function() {
  console.log("Server started on port 3000");
});
