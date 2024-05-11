const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    pass: { type: String, required: true },
    logged: {  type: Boolean, required: true}
});
const User = mongoose.model('User', UserSchema);
module.exports = User;