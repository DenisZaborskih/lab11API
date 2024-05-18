const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true, unique: true },
    text: { type: String, required: true },
    author: { type: Number, required: true}
});
const Post = mongoose.model('Post', UserSchema);
module.exports = Post;