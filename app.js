var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const expressLayouts = require('express-ejs-layouts');
const MongoDBClient = require("mongodb").MongoClient;
const assert = require('assert');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
var MongoStore = require('connect-mongo')(session) ;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// Passport config 
require('./config/passport')(passport);

// add express ejs layout
app.use(expressLayouts);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// connect to mongodb
const db = require('./config/key').MONGO_URL;
mongoose.connect(db,{
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
}).then(()=>{
  console.log("Database connected...");
}).catch(err => {
  console.log("Database connection error: "+err);
});
//Ép Mongoose sử dụng thư viện promise toàn cục
// mongoose.Promise = global.Promise;
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Express session
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({mongooseConnection: mongoose.connection}),
  cookie: { maxAge: 8*60*60*1000 },
}));
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
// connect fash
app.use(flash());
// Global vars
app.use((req,res,next)=>{
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.warning_msg = req.flash('warning_msg');
  res.locals.error = req.flash('error');
  res.locals.message = req.flash();
  res.locals.session = req.session;
  // res.locals.error_arr = req.flash('error_arr');
  next();
});
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error_arr = req.flash('error_arr');
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
