const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/bwild', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const randomNo=Math.floor(Math.random()*100 + 20);
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            images : [{url : 'https://res.cloudinary.com/dl44at5dy/image/upload/v1645634446/Bwild/gkr29arujkfad7nw52fn.jpg',filename : 'Bwild/gkr29arujkfad7nw52fn'}],
            price : randomNo,
            geometry: { type: 'Point', coordinates: [ cities[random1000].longitude, cities[random1000].latitude] },
            description :'Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio accusantium, eveniet cum quasi vitae a eos. Quos quaerat vero aperiam dolor reprehenderit ex aspernatur maiores voluptates cupiditate facilis? Impedit, dolorem.', 
            title: `${sample(descriptors)} ${sample(places)}`
        })
        camp.author=('620bbe094940e573c47b56c1');
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})