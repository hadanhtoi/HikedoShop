var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const expressLayouts = require('express-ejs-layouts');
const MongoDBClient = require("mongodb").MongoClient;
const assert = require('assert');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// add express ejs layout
app.use(expressLayouts);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// connect to mongodb
// const dbName = require('./config/key').DB_NAME;
const url = require('./config/key').MONGO_URL;
const client = new MongoDBClient(url, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//connect DB
client.connect(err => {
  assert.equal(null, err);
  console.log("Connected successfully to mongoDB");
  // const db = client.db(dbName);
  // const cursor = db.collection('Products').find({ brand_id: 10 });
  // db.collection('Products').count({ brand_id: 1 }, (err, num) => {
  //   console.log(num);
  // });
});

module.exports = app;
