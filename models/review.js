const mongoose = require('mongoose');
const User = require('./user');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
    text: {
        type : String
    },
    rating :{
        type : Number
    },
    user :{
        type : Schema.Types.ObjectId,
        ref : 'User'
    }
});

module.exports = mongoose.model('Review', ReviewSchema);