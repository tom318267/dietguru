var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var api_key = 'd2c97c9155888c0894a54f37d5ed693d-49a2671e-97f8721b';
var domain = 'sandbox36438745410943d6b425073ac0cab35c.mailgun.org';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});




// root route
router.get("/", function(req, res){
    res.render("diet/landing");
});


// show register form
router.get("/register", function(req, res){
    res.render("register");
});

//handle sign up logic
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err,user){
        if(err){
            req.flash("error", err.message);
            return res.render("register", {"error": err.message});
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to DietGuru " + user.username + "!");
            res.redirect("/");
        });
    });
});


//show login form
router.get("/login", function(req, res){
    res.render("login");
});

// handling login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/diet",
        failureRedirect: "/login"
    }), function(req, res){
    
});

// logout route
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/");
});

// contact form
router.get("/contact", function(req, res){
    res.render("contact");
});

// contact post
router.post("/contact", function(req, res){
    var data = {
  name: req.body.name,
  from: req.body.email,
  phone: req.body.phone,
  subject: req.body.name,
  to: "ogar318267@gmail.com",
  text: req.body.message
  
};
 
mailgun.messages().send(data, function (error, body) {
    if(error){
        console.log(error);
    }
    console.log(body);
    req.flash("success", "Message Sent!");
    return res.redirect("/");
});
});




 




// middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

module.exports = router;