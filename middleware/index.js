var Place   = require("../models/place"),
	Comment = require("../models/comment"),
 	Review  = require("../models/review");

var middlewareObj = {};

middlewareObj.checkPostOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Place.findById(req.params.id, function(err, foundPlace){
		if(err || !foundPlace){
			req.flash("error", "Place not found");
			res.redirect("/sights");
		}
		else{
			if(foundPlace.author.id.equals(req.user.id)){
				next();
			}
			else{
				req.flash("error", "You don't have a permission to do that");
				res.redirect("/sights");
			}
		}
		});
	}
	else{
		req.flash("error", "You need to be logged in to do that");
		res.redirect("back");
	}
};

middlewareObj.checkCommentOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id, function(err, foundComment){
		if(err || !foundComment){
			req.flash("error", "Comment not found");
			res.redirect("back");
		}
		else{
			if(foundComment.author.id.equals(req.user.id)){
				next();
			}
			else{
				req.flash("error", "You don't have a permission to do that");
				res.redirect("back");
			}
		}
		});
	}
	else{
		req.flash("error", "You need to be logged in to do that");
		res.redirect("back");
	}
};

middlewareObj.checkReviewOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Review.findById(req.params.review_id, function(err, foundReview){
            if(err || !foundReview){
                res.redirect("back");
            }  else {
                // does user own the comment?
                if(foundReview.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.checkReviewExistence = function (req, res, next) {
    if (req.isAuthenticated()) {
        Place.findById(req.params.id).populate("reviews").exec(function (err, foundPlace) {
            if (err || !foundPlace) {
                req.flash("error", "Place not found.");
                res.redirect("back");
            } else {
                // check if req.user._id exists in foundPlace.reviews
                var foundUserReview = foundPlace.reviews.some(function (review) {
                    return review.author.id.equals(req.user._id);
                });
                if (foundUserReview) {
                    req.flash("error", "You already wrote a review.");
                    return res.redirect("/sights/" + foundPlace._id);
                }
                // if the review was not found, go to the next middleware
                next();
            }
        });
    } else {
        req.flash("error", "You need to login first.");
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		next();
	}
	else{
		req.flash("error", "You need to be logged in to do that");
		res.redirect("/login");
	}
};

module.exports = middlewareObj;