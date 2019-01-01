var express = require("express");
var mongoose = require("mongoose");

var dietSchema = new mongoose.Schema({
    name: String,
    image: String,
    imageId: String,
    created: {type: Date, default: Date.now},
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment"
            }  
        ]
});

module.exports = mongoose.model("Diet", dietSchema);