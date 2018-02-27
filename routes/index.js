var express = require('express');
var router = express.Router();
var auth = require("../middleware/auth");

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
      req.session.name = success.displayName.trim();
      req.session.username = username;
      console.log("redirecting to /");
      res.redirect("/");
    }
  };
  auth.authenticate(username, password, callback);
});

router.use(auth.ensureLoggedIn);

router.get('/logout', function(req, res) {
  req.session.destroy();
  res.redirect('/');
});
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


module.exports = router;
