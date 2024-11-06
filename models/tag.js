const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tagSchema = new Schema ({
    tag : [String]

}, { timestamps: true , collection: 'tags'});

const  Tag = mongoose.model('tags', tagSchema);

module.exports = Tag;