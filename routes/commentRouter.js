const express = require('express')
const router = express.Router();

const {
    handleCreateComment,
    handleDeleteComment,
    handleGetComment
} = require('../controllers/commentController')

router
    .route('/')
        .post(handleCreateComment)
        .get(handleGetComment)
        .delete(handleDeleteComment)

module.exports = router;