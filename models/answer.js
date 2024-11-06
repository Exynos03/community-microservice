const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const answerSchema = new Schema ({
    question_id:{
        type: String,
        required:true
    },
    answer: {
        type: String,
        require: true
    },
    comment_id: [String],
    metadata:{
        no_of_comments:{
            type: Number,
            require: true
        },
        no_of_upvotes:{
            type: Number,
            require: true
        },
        createdBy:{
            type: String,
            require: true
        },
        modifiedBy:{
            type: String
        },
        isDuplicate: {
            type: Boolean
        },
        isEdited: {
            type: Boolean
        },
        answer_type: {
            type: String
        },
        answer_status: {
            type: String
        },
        isTopAnswer: {
            type: Boolean
        },
        isRecommended: {
            type: Boolean
        }
    }

}, { timestamps: true , collection: 'answers' });

const Answer = mongoose.model('answers', answerSchema);

module.exports = Answer;