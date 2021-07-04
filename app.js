const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const dotenv = require('dotenv').config();
const session = require('express-session');
const app = express();
const uuid = require('uuid').v4;

// -----------------

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(session({
  secret: uuid(),
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}));

app.use(express.static(path.join(__dirname, 'public')))

/* routes */
const adminPageRouter = require('./routes/adminpage-route')
const adminLoginRouter = require('./routes/adminlogin-route')
const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const registrationRouter = require('./routes/registration-route')
const loginRouter = require('./routes/login-route')
const dashboardRouter = require('./routes/dashboard-route')
const logoutRouter = require('./routes/logout-route')

app.use('/admin', adminPageRouter)
app.use('/admin', adminLoginRouter)
app.use('/user', indexRouter)
app.use('/user', usersRouter)
app.use('/user', registrationRouter)
app.use('/user', loginRouter)
app.use('/user', dashboardRouter)
app.use('/user', logoutRouter)

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
  res.status(err.status || 500)
  res.render('error')
});

module.exports = app
