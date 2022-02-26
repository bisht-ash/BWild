const Campground = require('../models/campground');
const User = require('../models/user');
module.exports.renderLoginForm=(req,res)=>{
    if(req.isAuthenticated()){
        req.flash('error', 'You are already logged in');
        res.redirect('/campgrounds');
    }
    else{
        res.render('users/login');
    }
}

module.exports.show=async(req,res)=>{
    const {user_id}=req.params;
    const campgrounds=await Campground.find({author : user_id}).populate('author');
    res.render('users/show' ,{campgrounds});

}

module.exports.renderRegisterForm=(req,res)=>{
    if(req.isAuthenticated()){
        req.flash('error', 'You are already logged in');
        res.redirect('/campgrounds');
    }
    else{
        res.render('users/register');
    }
}

module.exports.register=async (req,res)=>{
    try{
        const {name, username,email,password}=req.body;
        const user=new User({name,username,email});
        const newUser=await User.register(user,password);
        req.login(newUser,(e)=>{
            if(e) return next(e)
            req.flash('success','Welcome to BWild');
            res.redirect('/campgrounds')
        })
    }
    catch(e){
        req.flash('error',e.message);
        res.redirect('/register');
    }
}

module.exports.login=async (req,res)=>{
    if(req.session.returnTo==='/login' || req.session.returnTo==='/register'){
        req.session.returnTo='/campgrounds';
    }
    req.flash('success','Welcome Back!')
    res.redirect(req.session.returnTo);
}

module.exports.logout=(req,res)=>{
    req.logout();
    req.flash('success','Good Bye!')
    res.redirect('/campgrounds')
};