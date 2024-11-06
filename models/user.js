const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema ({
    user_id: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    name:{
        type: String,
        require: true
    }
}, { timestamps: true , collection: 'user'});

const User = mongoose.model('user', userSchema);

module.exports = User;