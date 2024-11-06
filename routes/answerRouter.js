const express = require('express')
const router = express.Router();

const {
    handleGetAnswer,
    handleCreateAnswer,
    handleEditAnswer,
    handleDeleteAnswer,
    handleCreateTopAnswer,
    handleGetTopAnswer,
    handleAnswertUpvote,
    handleRecommendedAnswer
} = require('../controllers/answerController')

router
    .route('/')
        .post(handleCreateAnswer)
        .get(handleGetAnswer)
        .patch(handleEditAnswer)
        .delete(handleDeleteAnswer)

router 
    .route('/topAnswer')
        .get(handleGetTopAnswer)
        .post(handleCreateTopAnswer)

router
    .route('/upVote')
        .post(handleAnswertUpvote)

router
    .route('/recommendAnswer')
        .post(handleRecommendedAnswer)

module.exports = router;