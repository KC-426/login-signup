const express = require("express")

const authController = require('../controllers/auth')

const router = express.Router()

router.post('/signup', authController.postSignup)

router.post('/login', authController.postLogin )

router.post('/forgot-password', authController.forgotPassword )

module.exports = router