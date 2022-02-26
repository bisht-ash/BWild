const express = require('express');
const appError= require('../utils/appError');
const {wrapAsync,isLoggedIn, isAuthorReview} =require('../utils/utilities');
const validationJoi = require('../utils/validationSchema');
const router = express.Router({mergeParams : true});
const reviewController=require('../controllers/review');


const validateReviews=(req,res,next)=>{
    const result =validationJoi.reviewsValidateSchema.validate(req.body);
    if(!result.error){
        next();
    }
    else{
        let errorMessage="";
        result.error.details.forEach(e=>errorMessage+=`${e.message}, `);
        throw new appError(errorMessage,400,req.body);
    }
}

router.post('/',isLoggedIn,validateReviews, wrapAsync(reviewController.create))

router.route('/:review_id')
    .put(isLoggedIn,isAuthorReview,validateReviews,wrapAsync(reviewController.update))
    .delete(isLoggedIn,isAuthorReview,wrapAsync(reviewController.delete))

router.get('/:review_id/edit',isLoggedIn,isAuthorReview,wrapAsync(reviewController.renderEditForm));
module.exports=router;