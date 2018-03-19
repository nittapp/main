const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = mongoose.model('User', new Schema({
	username: String,
	isAdmin: Boolean,
}));

const isAdmin = function(username) {
  return new Promise(function(resolve, reject) {
    User.findOne({username: username}).then(function(user) {
      if (user === null) {
        return resolve(false);
      }
console.log(user);
      resolve(user.isAdmin);
    }).catch(function(err) {
      reject(err);
    });
  });
}

module.exports.isAdmin = isAdmin;

