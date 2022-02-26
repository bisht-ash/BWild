const Campground = require('../models/campground');
const Review =require('../models/review')
const appError= require('../utils/appError');

module.exports.create=async (req,res,next)=>{
    const { camp_id }=req.params;
    const review= new Review(req.body);
    review.user=(req.user._id); 
    await review.save();
    const campground = await Campground.findById(camp_id);
    campground.reviews.push(review);
    await campground.save();
    await campground.populate('author');
    req.flash('success',"Successfully added the review");
    res.redirect(`/campgrounds/${camp_id}?page=${req.query.page}&limit=${req.query.limit}`);
}

module.exports.renderEditForm=async (req,res,next)=>{
    const { camp_id, review_id}=req.params;
    const review = await Review.findById(review_id);
    if(!review){
        throw new appError('Data not found',404);
    }
    res.render('reviews/edit', { review , camp_id, page:req.query.page , limit:req.query.limit});
};

module.exports.update=async (req,res,next)=>{
    const {camp_id , review_id} = req.params;
    const review = await Review.findByIdAndUpdate(review_id,req.body,{runValidators:true}).populate('user');
    req.flash('success',"Successfully edited the review");
    res.redirect(`/campgrounds/${camp_id}?page=${req.query.page}&limit=${req.query.limit}`);
}

module.exports.delete=async(req,res,next)=>{
    const {camp_id, review_id}=req.params;
    await Campground.findByIdAndUpdate(camp_id, {$pull : {reviews : review_id}})
    const result= await Review.findByIdAndDelete(review_id);
    req.flash('success',"Successfully deleted the review");
    res.redirect(`/campgrounds/${camp_id}?page=${req.query.page}&limit=${req.query.limit}`);
}