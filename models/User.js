const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
	username: String,
	isAdmin: Boolean,
});

const isAdmin = async (username) => {
	const user = await User.findOne({username: username});
	if (user === null) {
		return false;
	}
	return user.isAdmin;
}

module.exports.isAdmin = isAdmin;

