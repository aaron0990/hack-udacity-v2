var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*'); //second parameter specifies the url that can have access, no url means all can access.
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
	next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
