const express = require('express')
const router = express.Router();

const {
    handleGetFeaturedPost,
    handleGetPopularToday,
    handleGetSimilarPost
} = require('../controllers/shortcutController')

router.route('/featuredPost').get(handleGetFeaturedPost)

router.route('/popularToday').get(handleGetPopularToday)

router.route('/similarPost').get(handleGetSimilarPost)

module.exports = router;