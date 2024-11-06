const express = require('express')
const router = express.Router();

const {
    handleCreateQuestion,
    handleGetQuestion,
    handleEditQuestion,
    handleDeleteQuestion,
    handleQuestionUpvote,
    handleGetQuestionCategory,
    handleGetQuestionForLandingPage,
    handleGetQuestionTopic,
    handleQuestionView,
    handleGetTags,
    handleGetQuestionByID
} = require('../controllers/questionController')

router
    .route('/')
        .post(handleCreateQuestion)
        .patch(handleEditQuestion)
        .delete(handleDeleteQuestion)

router
    .route('/search')
        .get(handleGetQuestion)

router
    .route('/questionOnLandingPage')
        .get(handleGetQuestionForLandingPage)

router
    .route('/upVote')
        .post(handleQuestionUpvote)

router
    .route('/view')
        .post(handleQuestionView)

router
    .route('/category')
        .get(handleGetQuestionCategory)
        
router  
    .route('/topic')
        .get(handleGetQuestionTopic)

router
    .route('/tag')
        .get(handleGetTags)

router 
    .route('/findByID')
        .get(handleGetQuestionByID)

module.exports = router;