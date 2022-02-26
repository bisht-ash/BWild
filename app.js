const express = require('express');
const app = express();
const appError= require('./utils/appError');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate =require('ejs-mate');
const campgroundRoutes=require('./routes/campgrounds');
const reviewsRoutes=require('./routes/reviews');
const usersRoutes=require('./routes/users')
const session =require('express-session');
const MongoStore= require('connect-mongo');
const flash = require('connect-flash');
const passport=require('passport');
const localPassport=require('passport-local');
const User = require('./models/user');
const Campground = require('./models/campground');
const mongoSanitize=require('express-mongo-sanitize');
const helmet=require('helmet');
const { wrapAsync } = require('./utils/utilities');

const dbUrl=process.env.DB_URL || 'mongodb://localhost:27017/bwild';
// const dbUrl='mongodb://localhost:27017/bwild'
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify : false
});
mongoose.set('useFindAndModify', false);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname,'public')));

app.engine('ejs',ejsMate);
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(mongoSanitize({
    replaceWith : ''
}));

const secret=process.env.SECRET || 'thisshouldbeabettersecret';

const sessionOption={
    store : MongoStore.create({
        mongoUrl : dbUrl,
        ttl : 24 * 60 * 60,
        crypto: {
            secret: secret
        }
    }),
    name : "session",
    secret : secret,
    resave : false,
    saveUninitialized : true,
    cookie :{
        expires : Date.now() + 1000*60*60*24*7,
        // secure : true,
        maxAge : 1000*60*60*24*7,
        httpOnly : true
    }
}

app.use(session(sessionOption));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new localPassport(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    req.session.returnTo=req.originalUrl;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    res.locals.currentUser=req.user;
    next();
})

app.use('/',usersRoutes);
app.use('/campgrounds',campgroundRoutes);
app.use('/campgrounds/:camp_id/reviews',reviewsRoutes);


app.get('/', wrapAsync(async(req, res) => {
    const campgrounds=await Campground.find({});
    res.render('home',{campgrounds});
}));

app.post('/search', wrapAsync(async(req, res)=>{
    const {title}=req.body;
    const campgrounds=await Campground.find({title : title});
    res.render('search',{campgrounds});
}));


app.all('*',(req,res)=>{
    throw new appError('Page not found!',404);
})
app.use((err,req,res,next)=>{
    if(!err.message) err.message="Something went wrong!";
    if(!err.status) err.status=500;
    res.status(err.status).render('errors/errorHandler',{err});
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})