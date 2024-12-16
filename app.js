var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

require('dotenv').config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
const pool = require('./routes/pool');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const loadHeaderAndFooterMiddleware = (req, res, next) => {
  pool.query('SELECT * FROM ??', ['index'], (error, results) => {
    if (error)
      res.send('Reload the page')

    res.locals.index = results[0];
    res.locals.socialMedia = [
      {
        name: "facebook",
        icon: '<i class="bi bi-facebook"></i>'
      },
      {
        name: "instagram",
        icon: '<i class="bi bi-instagram"></i>'
      },
      {
        name: "linkedin",
        icon: '<i class="bi bi-linkedin"></i>'
      },
      {
        name: "twitter",
        icon: '<i class="bi bi-twitter"></i>'
      },
    ];
    res.locals.googleMapApi = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3578.848012292866!2d78.20635777418222!3d26.234127577058068!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3976c1a767cec033%3A0x1aab20fb7ba7ca51!2sSouranjh%20Technology%20Service%20%26%20Training%20Institute!5e0!3m2!1sen!2sin!4v1732956454184!5m2!1sen!2sin"
    next()
  })
}

app.get("/", (req, res) => {
  res.redirect('/index')
})

app.use('/index', loadHeaderAndFooterMiddleware, indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);

app.use((req, res) => {
  res.status(404).render('404'); // Render the 404 page for non-API routes
});

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

module.exports = app;
