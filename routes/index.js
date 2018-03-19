var express = require('express');
var router = express.Router();
var auth = require("../middleware/auth");
var config = require("../config");
var isAdmin = require("../models/User").isAdmin;

router.get('/login', function(req, res) {
  if (req.session.isLoggedIn) return res.redirect("/");
  res.render('login', { msg: "" });
});

router.post('/login', function(req, res, next) {  
  if (req.session.isLoggedIn) return res.redirect("/");

  console.log("in processLogin");
  var username = req.body.email.replace("@nitt.edu", "");
  var password = req.body.password;
  var callback = function (fail, success) {
    if (fail) {
      console.log(fail);
      res.render('login', { message: "The username or password you entered is wrong" });
    } else {
      console.log("Creds match");

      req.session.isLoggedIn = true;
      req.session.name = success.name.trim();
      req.session.username = username;
      isAdmin(username).then(function(isAdmin) {
        req.session.isAdmin = isAdmin;
        console.log("redirecting to /");
        res.redirect("/");
      }).catch(function(err) {
        console.log("error while checking isAdmin", err);
        req.session.isAdmin = false;
        res.redirect("/");
      });
    }
  };
  auth.authenticate(username, password, callback);
});

router.use(auth.ensureLoggedIn);

router.get('/navboard', function(req, res, next) {
  res.render('navboard');
});

// see if the request should go to any of the containers
var proxy = require('http-proxy').createProxyServer({changeOrigin: true, autoRewrite: true, protocolRewrite: "http"});
proxy.on('proxyReq', function(proxyReq, req, res, options) {
  // overwrite headers
  console.log("req for", req.path, req.__container__, req.session);
  var oldSetHeader = res.setHeader.bind(res);
  res.setHeader = function(name, value) {
    if (name.toLowerCase() != "x-frame-options")
      oldSetHeader(name, value);
  };
  proxyReq.setHeader('X-NITT-APP-USERNAME', req.session.username);
  proxyReq.setHeader('X-NITT-APP-NAME', req.session.name);
  proxyReq.setHeader('X-NITT-APP-IS-ADMIN', req.session.isAdmin.toString());
  proxyReq.setHeader('X_NITT_APP_USERNAME', req.session.username);
  proxyReq.setHeader('X_NITT_APP_NAME', req.session.name);
  proxyReq.setHeader('X_NITT_APP_IS_ADMIN', req.session.isAdmin.toString());
  /* header_name : X-NITT-APP-MESS-SECRET-KEY 
value  : bI88z6l6oATWU04qBQt7FR45v6Fs208S */
  proxyReq.setHeader('X-NITT-APP-MESS-SECRET-KEY', "bI88z6l6oATWU04qBQt7FR45v6Fs208S"); 
  proxyReq.setHeader('X_NITT_APP_MESS_SECRET_KEY', "bI88z6l6oATWU04qBQt7FR45v6Fs208S"); 
});
proxy.on('proxyRes', function(_,_,proxyRes) {
  proxyRes.on('data', (c) => { console.log(c.toString()); });
});
proxy.on('error', function(e, req, res) {
  console.log(e);
  res.send(500);
  res.end("Unable to access this service right now");
});
var proxyHandler = function(req, res, next) {
  console.log(req.path, req.__container__, req.session);
  for (var port in config.ports) {
    var container = config.ports[port];
    if (req.__container__ == container) {
      return proxy.web(req, res, {
        target: container,
      });
    }
  }
  next();
};

router.get('/downloads/:file', function(req, res) {
  var file = __dirname + "/../downloads/" + req.params.file;
  res.download(file);
});

router.get('/transport_schedule', function(req, res) {
  res.render('transport_schedule');
});

router.get('/contacts', function(req, res) {
  res.render('contacts');
});

router.get('/logout', function(req, res) {
  req.session.destroy();
  res.redirect('/');
});
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


module.exports.router = router;
module.exports.proxyHandler = proxyHandler;
