const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
});

const User = mongoose.model('User', userSchema);

readUser = async(options = {}) => {
    if (Object.entries(options).length == 0) return User.find().lean();
    else if (options.username) return User.findOne(options).lean();
    else return undefined;
}

exports.readUser = readUser;
