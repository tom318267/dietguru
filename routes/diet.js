var express = require("express");
var router = express.Router();
var Diet = require("../models/diet");
var middleware = require("../middleware");
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'djso6lywz', 
  api_key: '984992462265655', 
  api_secret: 'y9c8MaO_x7OiYHSSnR4CbWO4Eug'
});

// Index route
router.get("/", function(req, res){
   Diet.find({}, function(err, findPic){
       if(err){
           console.log(err);
       } else {
           res.render("diet/index", {findPic: findPic});
       }
   });
});


// New route
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("diet/new");
});

// Create route
router.post("/", middleware.isLoggedIn, function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newPic = {name: name, image: image, author: author}
    Diet.create(newPic, function(err, newlyCreated){
        if(err){
            res.render("diet/new");
            console.log(err);
        } else {
            console.log(newlyCreated);
            res.redirect("/diet");
        }
    });
});

// Show route
router.get("/:id", function(req, res){
    Diet.findById(req.params.id).populate("comments").exec (function(err, foundPic){
        if(err){
            console.log(err);
        } else {
             if (!foundPic) {
                return res.status(400).send("Item not found.")
            }
            res.render("diet/show", {foundPic: foundPic});
        }
    });
});

// Edit route
router.get("/:id/edit", middleware.checkDietOwnership, function (req, res){
            Diet.findById(req.params.id, function(err, foundPic){
                
        if (!foundPic) {
            return res.status(400).send("Item not found.")
        }
            
        res.render("diet/edit", {foundPic: foundPic});  
                
                
    });
});

// Update route
router.put("/:id", middleware.checkDietOwnership, function(req, res){
    Diet.findByIdAndUpdate(req.params.id, req.body.diet, function(err, updatedPic){
        if(err){
            console.log(err);
        } else {
            res.redirect("/diet/" + req.params.id);
        }
    });
});


// Delete route
router.delete("/:id", middleware.checkDietOwnership, function(req, res){
    Diet.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/diet");
        } else {
            res.redirect("/diet");
        }
    });
});




module.exports = router;