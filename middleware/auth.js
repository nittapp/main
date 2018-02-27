var Imap = require('imap');
var ldap = require('ldapjs');

var ldapurl = 'ldap://10.0.0.39:389';
var imaphost = "10.0.0.173";
var imapport = 143;
var domain = 'octa.edu';

var ensureLoggedIn = function(req, res, next) {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  next();
}

var getUserInfo = function(username, callback){
  var client = ldap.createClient({
    url: ldapurl
  });
  var server ="106114062";
  var password = "Octa4062";
  var cn = server+'@'+domain;
  client.bind(cn,password,function(err){ console.log(err); });

  if(/^\d{9}/.test(username) == false) return callback(new Error("Invalid roll number"));
  var opts = {
    scope: 'sub',
    filter: "(cn=" + username + ")",
  };
  var DN = "dc=octa,dc=edu";
  client.search(DN, opts, function(err, res) {
    if (err){
      callback(err);
    }else{
      res.on('searchEntry', function(entry) {
        var ret = Object.assign({}, entry.object);
        ret.department = entry.object.dn.match(/OU=([^,]+),DC=octa/)[1];
        callback(null,ret);
        client.unbind(function (err) {});
      });
      res.on('error', function(err) {
        console.error('error: ' + err.message);
        client.unbind(function (err) {});
      });
    }
  });
};

var authenticate=function(username, password, callback){
  if(!password) return callback(new Error("Password required"));
  var client = ldap.createClient({
    url: ldapurl
  });

  console.log("Trying ldap login");
  var cn = username+'@'+domain;
  client.bind(cn,password,function(err){
    console.log("hi");
    if (err){
      console.log(err);
      console.log("Trying Imap Login");
      var imap = new Imap({
        user: username,
        password: password,
        host: imaphost,
        port: imapport,
        tls: false
      });
      imap.once('ready', function() {
        imap.end();
        console.log("Authenticated");
        getUserInfo(username, callback);
      });
      imap.once('error', function(err) {
        console.log(err);
        callback(err);
      });
      imap.connect();
    }else{
      client.unbind(function (err) {});
      console.log("Authenticated");
      getUserInfo(username, callback);
    }
  });
};

var initalPage = function (req, res, next) {
  var init={};
  init.rollNumber = req.session.rollNumber;
  init.name = req.session.name;
  res.render('index', { init: init, title:"The NITT App" });
};

var logout = function(req, res, next){
  req.session.destroy();
  res.redirect('/');
};

module.exports.ensureLoggedIn = ensureLoggedIn;
module.exports.authenticate = authenticate;
module.exports.processLogin = processLogin;
module.exports.initalPage = initalPage;
module.exports.logout = logout;
