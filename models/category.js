const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema ({
    category : [String]

}, { timestamps: true , collection: 'categories'});

const  Category = mongoose.model('categories', categorySchema);

module.exports = Category;