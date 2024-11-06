const express = require('express')
const router = express.Router();

const {
    handleRegisterUser,
    handleGetUser
} = require('../controllers/registerUserController')

router
    .route('/')
        .post(handleRegisterUser)
        .get(handleGetUser)

module.exports = router;