const mongoose = require('mongoose');
const Review =require('./review')
const User = require('./user');
require('dotenv').config();
const Schema = mongoose.Schema;
const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
})
const ImageSchema =new Schema({
    url : String,
    filename : String
})
const option = {toJSON : {virtuals : true}};

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload/','/upload/w_300/');
})
const CampgroundSchema = new Schema({
    title: {
        type : String,
        required : true
    },
    price: {
        type : Number,
        required : true,
        min : 0
    },
    images : {
        type : [ImageSchema]
    },
    description: { 
        type :String
    },
    location:{
        type : String,
        required : true
    },
    reviews : [ {
            type : Schema.Types.ObjectId,
            ref : 'Review'
        }
    ],
    author : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    geometry : {
        type : {
            type : String,
            enum : ['Point'],
            required : true
        },
        coordinates : {
            type : [Number],
            required : true
        }
    }
},option);

CampgroundSchema.virtual('properties.HTML').get(function(){
    return `<a href=campgrounds/${this._id}?page=1&limit=2>${this.title}</a>`
})

CampgroundSchema.post('findOneAndDelete',async function(camp){
    console.log(camp.reviews.length);
    if(camp.reviews.length!==0){
       await Review.deleteMany({_id : {$in : camp.reviews}});
    }
    if(camp.images.length!==0){
        camp.images.forEach(async (img)=>{
            await cloudinary.uploader.destroy(img.filename);
        })   
    }
})



module.exports = mongoose.model('Campground', CampgroundSchema);