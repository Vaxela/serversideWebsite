var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const expressHandlebars = require('express-handlebars')
const session = require('express-session')
const bodyParser = require('body-parser')
var indexRouter = require('./routes/index');
var accountsRouter = require('./routes/accounts');
var accountRouter = require('./routes/account');
var compression = require('compression');
var helmet = require('helmet');
var app = express();
app.use(helmet());

//For Hashing
var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);

//For api
const jsonwebtoken = require('jsonwebtoken')

var functionExport = require("./modules/functionExport")

functionExport.default.SetDatabaseImp(0);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', expressHandlebars({
  defaultLayout: 'main.hbs',
}))


app.use(session({
  resave: true,
saveUninitialized: true,
secret: "somerandomtextgjozudbe"
}))

app.use(function(req, res, next){
	res.locals.session = req.session
	next()
})

app.use(compression()); //Compress all routes
app.use(logger('tiny'));
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}))
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/accounts', accountsRouter);
app.use('/account', accountRouter);

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
