const express=require('express');
const {wrapAsync,isLoggedIn} = require('../utils/utilities');
const passport= require('passport');
const userControllers=require('../controllers/user')
const router=express.Router({mergeParams:true});


router.route('/register')
    .get(userControllers.renderRegisterForm)
    .post(wrapAsync(userControllers.register))

router.route('/login')
    .get(userControllers.renderLoginForm)
    .post(passport.authenticate('local' , { failureRedirect: '/login', failureFlash: true, failureMessage : "Try Again"}),
wrapAsync(userControllers.login));

router.get('/logout',userControllers.logout)

router.get('/user/:user_id',isLoggedIn,userControllers.show);

module.exports=router;