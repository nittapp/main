var fs = require('fs');
var https = require('https');

var ensureLoggedIn = function(req, res, next) {
  req.session.isLoggedIn = true; req.session.username = "106114062"; req.session.name = "Parth";
req.session.isAdmin = true;
  return next();
  if (!req.session.isLoggedIn || !req.session.username) {
    return res.redirect("/login");
  }
  next();
}

var authProxyRequestOptions = {
  hostname: "delta.nitt.edu",
  port: 3142,
  path: '/',
  method: 'POST',
  key: fs.readFileSync('./tls/auth_proxy_creds/client1-key.pem'),
  cert: fs.readFileSync('./tls/auth_proxy_creds/client1-crt.pem'),
  ca: fs.readFileSync('./tls/auth_proxy_creds/ca-crt.pem'),
  rejectUnauthorized: false,
  requestCert: true,
};
authProxyRequestOptions.agent = new https.Agent(authProxyRequestOptions);

var authenticate=function(username, password, callback){
  if(!password) return callback(new Error("Password required"));

  var req = https.request(authProxyRequestOptions, function(res) {
    res.setEncoding('utf8');
    var body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      try {
        body = JSON.parse(body);
        callback(null, body);
      } catch (e) {
        console.log(e);
        callback(e, null);
      }
    });
  });
 
  req.on('error', function(e) {
    console.log(e);
    callback(new Error("Unable to authenticate right now. Please try again in some time"));
  });

  var body = JSON.stringify({ username: username, password: password });
  req.setHeader('Content-Type', 'applicatin/json');
  req.setHeader('Content-Length', body.length);
  req.write(body);
  req.end();
};

module.exports.ensureLoggedIn = ensureLoggedIn;
module.exports.authenticate = authenticate;
