const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema ({
    question_id:{
        type: String,
        required:true
    },
    answer_id: {
        type: String,
        required:true
    },
    comment: {
        type: String,
        require: true
    },
    createdBy: {
        type: String,
        require: true
    },
    status: {
        type: String,
        require: true
    }

}, { timestamps: true , collection: 'comments'});

const Comment = mongoose.model('comments', commentSchema);

module.exports = Comment;