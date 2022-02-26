const Campground =require('../models/campground');
const Review =require('../models/review');

function wrapAsync(fun){
    return function(req,res,next){
        fun(req,res,next).catch((e)=>next(e));
    }
}

function isLoggedIn(req,res,next){
    if(!req.isAuthenticated()){
        req.flash('error','You must be logged in first');
        res.redirect('/login');
    }
    else{
        next();
    }
}
const isAuthorCampground= async (req,res,next)=>{
    const {camp_id}=req.params;
    const campground= await Campground.findById(camp_id).populate('author');
    if(!campground.author._id.equals(req.user._id)){
        req.flash('error','You are not authorised!');
        res.redirect('/campgrounds');
    }
    else{
        next();
    }
}
const isAuthorReview= async (req,res,next)=>{
    const {camp_id,review_id}=req.params;
    const review= await Review.findById(review_id).populate('user');
    if(!review.user._id.equals(req.user._id)){
        req.flash('error','You are not authorised!');
        res.redirect(`/campgrounds/${camp_id}?page=${req.query.page}&limit=${req.query.limit}`);
    }
    else{
        next();
    }
}

const pagenate = async(req,res,next)=>{
    const campground = await Campground.findById(req.params.camp_id).populate('author');
    const page =parseInt(req.query.page);
    const limit=parseInt(req.query.limit);
    const startIndex= (page-1)*limit;
    const endIndex=page*limit;
    const results={};
    results.prev=0;
    results.next=0;
    if(startIndex > 0){
        results.prev={
            'page':page-1,
            'limit' : limit
        }
    }
    if(endIndex < campground.reviews.length){
        results.next={
            'page' : page+1,
            'limit' : limit
        }
    }
    let reviews=[];
    const result=campground.reviews.slice(startIndex,endIndex);
    for(let i=0 ; i<result.length;++i){
        const data =await Review.findById(result[i]).populate('user');
        reviews.push(data);       
    }
    results.reviews=reviews;
    results.campground=campground;
    results.page=page;
    results.limit=limit;
    res.results=results;
    next();
}

module.exports = {wrapAsync,isLoggedIn,isAuthorCampground,isAuthorReview,pagenate} ;