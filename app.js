var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport')

const cors = require('cors')

var session = require('express-session')
var fileStore = require('session-file-store')(session)

// var passport = require('passport')
// var authenticate = require('./authenticate')
var config = require('./config')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const postRouter = require('./routes/posts')
const commentPostRouter = require('./routes/commentPosts')

const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const flash = require('express-flash');
const url = config.mongoUrl

const connect = mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

connect.then((db) => {
  console.log('Connected correctly to server')
}, (err) => {console.log(err)})

var app = express();

app.use(cors());
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.use(bodyParser.json())

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
  
app.use(session({
  name: 'session-id', 
  secret: config.secretKey, 
  saveUninitialized: false, 
  resave: false, 
  store: new fileStore()
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/post', postRouter)
app.use('/comment', commentPostRouter)

app.use(express.static(path.join(__dirname, 'public')));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;