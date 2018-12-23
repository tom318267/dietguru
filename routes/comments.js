var express = require("express");
var router = express.Router({mergeParams: true});
var Diet = require("../models/diet");
var Comment = require("../models/comment");
var middleware = require("../middleware");


// Comments New
router.get("/new", middleware.isLoggedIn, function(req, res){
    Diet.findById(req.params.id, function(err, foundPic){
        if(err){
            console.log(err);
            res.redirect("/");
        } else {
            res.render("comments/new", {foundPic: foundPic});
        }
    });
});

// Comments Create
router.post("/", middleware.isLoggedIn, function(req, res){
    Diet.findById(req.params.id, function(err, postComment){
        if(err){
            console.log(err);
            res.redirect("/");
        } else {
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    req.flash("error", "Something went wrong");
                    console.log(err);
                } else {
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save comment
                    comment.save();
                    postComment.comments.push(comment);
                    postComment.save();
                    req.flash("success", "Successfully created comment");
                    res.redirect("/diet/" + postComment._id);
                }
            });
        }
    });
});

// Comment edit route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            res.redirect("back");
        } else {
            res.render("comments/edit", {foundPic_id: req.params.id, comment: foundComment});
        }
    });
    
});

// Comment update route
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        } else {
            res.redirect("/diet/" + req.params.id);
        }
    });
});

// Comment destroy route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    // findByIdAndRemove
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/diet/" + req.params.id);
        }
    });
});








module.exports = router;
