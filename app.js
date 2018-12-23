var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash    = require("connect-flash");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var Diet = require("./models/diet");
var Comment = require("./models/comment");
var User = require("./models/user");
var methodOverride = require("method-override");

// requiring routes
var commentRoutes = require("./routes/comments");
var dietRoutes = require("./routes/diet");
var indexRoutes = require("./routes/index");

// mongoose.connect("mongodb://localhost/diet_guru", {useNewUrlParser: true});
mongoose.connect("mongodb://tom318267>:2Ommy1986@ds243084.mlab.com:43084/dietguru", {useNewUrlParser: true});
mongoose.set("useFindAndModify", false);
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(flash());

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "DietGuru is the best!",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.use("/", indexRoutes);
app.use("/diet/:id/comments", commentRoutes);
app.use("/diet", dietRoutes);





app.listen(process.env.PORT, process.env.IP, function(){
    console.log("server running");
});
