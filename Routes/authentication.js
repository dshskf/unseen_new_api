const express = require('express')
const router = express.Router()

const model_selection = require('../middleware/model')
const jwt_validation = require('../middleware/isAuth')
const authController = require('../Controller/authentication')
const { validator } = require('../middleware/validator')

router.post('/login', validator.login, authController.PostLogin)

router.post('/reset', authController.SendEmailReset)
router.post('/reset/confirm', authController.updateUserPassword)
router.post('/reset/check', authController.CheckResetEmailLink)

router.post('/check-token', jwt_validation, model_selection, authController.check_token)


module.exports = router