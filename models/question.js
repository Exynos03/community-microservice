const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema ({
    question: {
        type: String,
        require: true
    },
    question_sub_text: {
        type: String,
    },
    answer_id:[String],
    metadata:{
        no_of_views:{
            type: Number,
            require: true
        },
        no_of_answers:{
            type: Number,
            require: true
        },
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
        category: {
            type: String
        },
        topic: {
            type: String
        },
        
        relatedTo: [String],

        isDuplicate: {
            type: Boolean
        },
        isEdited: {
            type: Boolean
        },
        question_type: {
            type: String
        },
        question_status: {
            type: String
        },
        topAnswerID: {
            type: String
        },
        hasRecommended: {
            type: Boolean
        }
    }

}, { timestamps: true , collection: 'questions'});

const Question = mongoose.model('questions', questionSchema);

module.exports = Question;