var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var articleRouter = require('./routes/article');
var commentRouter = require('./routes/comment');
var myInfoRouter = require('./routes/myInfo');
var joinUsRouter = require('./routes/joinUs');
var myprofileRouter = require('./routes/myprofile');
var serviceCenterRouter = require('./routes/serviceCenter');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());//json으로 한번 변환
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());//우리가 요청시 쿠키가 담겨있을텐데 키값을 오브젝트형태로 가공해줌
app.use(express.static(path.join(__dirname, 'public')));//public폴더를 static하게 쓰게하기위해 public폴더 안에 파일들 접근 그냥가능하게해줌
app.use(session({
  secret: 'asdasdasd',
  resave: false,
  saveUninitialized: true
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/article', articleRouter);
app.use('/comment', commentRouter);
app.use('/myInfo', myInfoRouter);
app.use('/joinUs', joinUsRouter);
app.use('/myprofile', myprofileRouter);
app.use('/serviceCenter', serviceCenterRouter);

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
