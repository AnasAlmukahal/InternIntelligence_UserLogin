const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    email:{type: String, required: true, unique: true},
    password: {type: String, required: true, unique: true},
    sessionId: {type: String, default: null},
    sessionActive: {type: String, default: false}
});
module.exports = mongoose.model('User', userSchema);