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
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
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

router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
      if(err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      // add cloudinary url for the image
      req.body.diet.image = result.secure_url;
      // add image's public_id to user pic
      req.body.diet.imageId = result.public_id;
      // add author to pic
      req.body.diet.author = {
        id: req.user._id,
        username: req.user.username
      }
      Diet.create(req.body.diet, function(err, newlyCreated) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        res.redirect('/diet/' + newlyCreated.id);
      });
    });
});


// Show route
router.get("/:id", function(req, res){
    Diet.findById(req.params.id).populate("comments").exec (function(err, foundPic){
        if(err){
            console.log(err);
        } else {
             if (!foundPic) {
                return res.status(400).send("Item not found.");
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

router.put("/:id", upload.single('image'), function(req, res){
    Diet.findById(req.params.id, async function(err, findPic){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
    if (req.file) {
                try{
                    await cloudinary.v2.uploader.destroy(findPic.imageId);
                    var result = await cloudinary.v2.uploader.upload(req.file.path);
                    findPic.imageId = result.public_id;
                    findPic.image = result.secure_url;
                } catch(err) {
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
            }
            findPic.name = req.body.name;
            findPic.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/diet/" + findPic._id);
        }
    });
});


// Delete route
router.delete("/:id", middleware.checkDietOwnership, function(req, res){
    Diet.findById(req.params.id, async function(err, findPic){
        if(err){
            req.flash("error", err.message);
            return res.redirect("back");
         }
         try {
            await cloudinary.v2.uploader.destroy(findPic.imageId);
            findPic.remove();
            req.flash("success", "Successfully deleted!");
            res.redirect("/diet");
        } catch(err) {
             if(err){
                 req.flash("error", err.message);
                 return res.redirect("back");
             }
         }
    });
});





module.exports = router;