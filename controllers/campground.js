const Campground = require('../models/campground');
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const mbxGeoCoding=require('@mapbox/mapbox-sdk/services/geocoding');

const MY_ACCESS_TOKEN=process.env.MAPBOX_TOKEN;
const geocoder= mbxGeoCoding({accessToken: MY_ACCESS_TOKEN});
cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
})

module.exports.index=async (req, res,next) => {
    const campgrounds = await Campground.find({}).populate('author');
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm=(req, res) => {
    res.render('campgrounds/new');
}

module.exports.create=async (req, res,next) => {

   const geoData= await geocoder.forwardGeocode({
       query : req.body.location,
       limit : 1
   }).send();
    const campground = new Campground(req.body);
    console.log(geoData.body.features);
    if(geoData.body.features.length===0){
        req.flash('error','Enter a valid location');
        res.redirect('/campgrounds/new');
    }
    else{
        campground.geometry=geoData.body.features[0].geometry;
        campground.author=(req.user._id);
        campground.images=req.files.map((f)=>{
        return { url : f.path , filename : f.filename }
        })
        console.log(campground);
        await campground.save();
        await campground.populate({
            path : 'reviews',
            populate : {
                path : 'author'
            }
        })
        console.log(campground);
        req.flash('success',"Successfully made a new campground");
        res.redirect(`/campgrounds/${campground._id}?page=1&limit=2`);
        }
    
}

module.exports.show=async (req, res,next) => {
    if(!res.results.campground){
        throw new appError('Data not found',404);
    }
    res.render('campgrounds/show', res.results);
}

module.exports.renderEditForm=async (req, res,next) => {
    const campground = await Campground.findById(req.params.camp_id)
    if(!campground){
        throw new appError('Data not found',404);
    }
    res.render('campgrounds/edit', { campground, page:req.query.page , limit:req.query.limit});
}

module.exports.update=async (req, res,next) => {
    const { camp_id } = req.params;
    const geoData= await geocoder.forwardGeocode({
        query : req.body.location,
        limit : 1
    }).send();
    if(geoData.body.features.length===0){
        req.flash('error','Enter a valid location');
        res.redirect(`/campgrounds/${camp_id}/edit`);
    }
    else{
        const campground = await Campground.findByIdAndUpdate(camp_id, req.body,{runValidators:true});
        const imgs=req.files.map((e)=>{ return {url : e.path ,filename : e.filename}});
        campground.images.push(...imgs);
        if(req.body.deleteImages && req.body.deleteImages.length){
            req.body.deleteImages.forEach(async (file)=>{
                console.log('hey');
                await cloudinary.uploader.destroy(file);
            })
            await campground.updateOne({$pull : {images : {filename : {$in : req.body.deleteImages}}}});
        }
        await campground.save();
        req.flash('success',"Successfully updated the campground");
    res.redirect(`/campgrounds/${camp_id}?page=${req.query.page}&limit=${req.query.limit}`);
    }
}

module.exports.delete=async (req, res,next) => {
    const {camp_id} = req.params;
    await Campground.findByIdAndDelete(camp_id);
    req.flash('success',"Successfully deleted the campground");
    res.redirect('/campgrounds');
}