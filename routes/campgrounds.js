const express = require('express');
const appError= require('../utils/appError');
const {wrapAsync,isLoggedIn,isAuthorCampground,pagenate} =require('../utils/utilities');
const validationJoi = require('../utils/validationSchema');
const router = express.Router({mergeParams:true});
const campgroundController=require('../controllers/campground');
const path= require('path');
const multer = require('multer');
const {storage}=require('../utils/cloudinary');

const upload=multer({storage : storage});

const validateCampgrounds=(req,res,next)=>{
    const result =validationJoi.campgroundsValidateSchema.validate(req.body);
    if(!result.error){
        next();
    }
    else{
        let errorMessage="";
        result.error.details.forEach(e=>errorMessage+=`${e.message}, `);
        throw new appError(errorMessage,400,req.body);
    }
}

router.route('/')
    .get(wrapAsync(campgroundController.index))
    .post(isLoggedIn,upload.array('image'),validateCampgrounds,wrapAsync(campgroundController.create))

router.get('/new',isLoggedIn,campgroundController.renderNewForm);

router.route('/:camp_id')   
    .get(pagenate ,wrapAsync(campgroundController.show))
    .put(isLoggedIn ,isAuthorCampground,upload.array('image'),validateCampgrounds ,wrapAsync(campgroundController.update))
    .delete(isLoggedIn ,isAuthorCampground,wrapAsync(campgroundController.delete))

router.get('/:camp_id/edit', isLoggedIn, isAuthorCampground , wrapAsync(campgroundController.renderEditForm));


module.exports=router;