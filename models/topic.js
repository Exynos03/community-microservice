const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const topicSchema = new Schema ({
    topic : [String]

}, { timestamps: true , collection: 'topics'});

const  Topic = mongoose.model('topics', topicSchema);

module.exports = Topic;