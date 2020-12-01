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
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate')

const app = express();

var _id = "";

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
  },
  googleId: {
    type: String
    // required: [true, "googleid is required"]
  },
  secret: {
    type: String
    // required: [true, "googleid is required"]
  }
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
// const secret = process.env.SECRET;
//
// userSchema.plugin(encrypt, { secret: secret , encryptedFields: ['password'] });

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },

  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({
      googleId: profile.id
    }, function(err, user) {
      return cb(err, user);
    });
  }
));


app.get("/", function(req, res) {
  res.render("home");
}); //app.get("/", function(req,res) {

app.get("/auth/google",
  passport.authenticate("google", {
    scope: ["profile"]
  })
);

app.get("/auth/google/secrets",
  passport.authenticate("google", {
    failureRedirect: "/login"
  }),
  function(req, res) {
    // Successful authentication, redirect secrets.
    res.redirect("/secrets");
  });

app.get("/login", function(req, res) {
  res.render("login");
}); //app.get("/login", function(req,res) {

app.get("/register", function(req, res) {
  res.render("register");
}); //app.get("/register", function(req,res) {

app.get("/secrets", function(req, res) {
  // if (req.isAuthenticated()) {
  //       res.render("secrets");
  // } else {
  //   res.redirect("/login");
  // }

  User.find({ secret: { $ne: null } },function(err,usersFound){

res.render("secrets", {
    newListItems: usersFound
});

  })

});//app.get("/secrets", function(req, res) {

app.get("/submit", function(req, res) {
  if (req.isAuthenticated()) {
    console.log(req.user);
    _id = req.user._id;
    res.render("submit");
  } else {
    res.redirect("/login");
  }
}) //app.get("/submit",function(req,res) {



app.get('/logout', function(req, res) {
  req.logout();
  res.redirect("/");
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


app.post("/submit",function(req,res){

secret = req.body.secret

User.findByIdAndUpdate({_id},{"secret": secret}, function(err, result){

        if(err){
            res.send(err)
        }
        else{
            res.redirect("/secrets");
        }

    });

  });//app.post("/submit",function(req,res){




app.listen(3000, function() {
  console.log("Server started on port 3000");
});
