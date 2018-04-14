var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require("express-session");
var bodyParser = require('body-parser');
var auth = require("./middleware/auth");
var config = require("./config");
var routes = require('./routes/index').router;
var proxyHandler = require('./routes/index').proxyHandler;
var users = require('./routes/users');
var harmon = require('harmon');

var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);
mongoose.connect(config.db);

var app = express();
app.enable("trust proxy");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(cookieParser('mahs3krit'));
app.use(session({
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  secret: 'SUPERsekret231',
  resave: true,
  saveUninitialized: true
}));

var selects = [];
var bodyselect = {};
bodyselect.query = 'body';
bodyselect.func = function(node) {
  var hack = "<script type='text/javascript' src='//app.nitt.edu/javascripts/iframe_hack.js'></script>";
  var rs = node.createReadStream();
  var ws = node.createWriteStream({outer: false});

  rs.pipe(ws, {end: false});
  rs.on('end', function() { ws.end(hack); });
};
selects.push(bodyselect);
app.use(harmon([], selects));
/*
app.use(function(req, res, next) {
  var oldsend = res.send.bind(res);
  res.send = function(statusOrData, data) {
console.log("hacking", req.path);
    if (typeof data != 'string') {
      data = statusOrData;
    }

    if (res.get('Content-Type') == 'text/html' || typeof data == 'string') {
      var n = data.lastIndexOf("</body>");
      if (n >= 0) {
        var prefix = data.substr(0, n);
        var hack = "<script type='text/javascript' src='/javascripts/iframe_hack.js'></script></body>";
        data = prefix + hack + data.substr(n + 8);
      }
    }
    oldsend(data);
  };
  next();
});*/


app.use(proxyHandler); // use this before body parser(, but after cookie parser), or post requests will hang

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  console.log("got req for ", req.path, req.__container__);
  next();
});

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.render('index', {});
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;

