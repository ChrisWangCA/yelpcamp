const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});


//passport自动添加了feild of username和password，他们是unique的，隐藏起来了
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema); 