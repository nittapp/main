var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/make_admin', function(req, res, next) {
  res.send('need to create the user');
});

module.exports = router;
