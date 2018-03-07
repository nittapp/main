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
        req.session.isAdmin = true;
        console.log("redirecting to /");
        res.redirect("/");
      }).catch(function(err) {
        console.log("error while checking isAdmin", err);
        req.session.isAdmin = true;
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
var proxy = require('http-proxy').createProxyServer({});
proxy.on('proxyReq', function(proxyReq, req, res, options) {
  proxyReq.setHeader('X_NITT_APP_USERNAME', req.session.username);
  proxyReq.setHeader('X_NITT_APP_NAME', req.session.name);
  proxyReq.setHeader('X_NITT_APP_IS_ADMIN', req.session.isAdmin.toString());
});
router.use(function(req, res, next) {
  for (var port in config.ports) {
    var container = config.ports[port];
    if (req.__container__ == container) {
      return proxy.web(req, res, {
        target: container,
      });
    }
  }
  next();
});

router.get('/logout', function(req, res) {
  req.session.destroy();
  res.redirect('/');
});
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


module.exports = router;
