const express = require('express')
const router = express.Router()

const jwt_validation = require('../middleware/isAuth')
const authModel = require('../Controller/authentication')
const { body } = require('express-validator')

const validator = {
    register: [
        body('username').not().isEmpty().isAlphanumeric().withMessage("Please input correct username!"),
        body('email').trim().isEmail().normalizeEmail().withMessage("Invalid Email!"),
        // body('phone').not().isEmpty().isMobilePhone().withMessage("Invalid Phone Number"),
        body('password').not().isEmpty().isLength({ min: 4 }).withMessage('Password At least 4 characters!')
    ],
    login: [
        body('username').not().isEmpty().isAlphanumeric().withMessage("Please input correct username!"),
        body('password').not().isEmpty().isLength({ min: 4 }).withMessage('Password At least 4 characters!')
    ],
    reset: [
        body('email').trim().isEmail().normalizeEmail().withMessage("Invalid Email!")
    ]
}

router.post('/register', validator.register, authModel.PostRegister)
router.post('/login', validator.login, authModel.PostLogin)

router.post('/reset/confirm', authModel.updateUserPassword)
router.post('/reset/check', authModel.CheckResetEmailLink)
router.post('/reset', authModel.SendEmailReset)

router.get('/edit', jwt_validation, authModel.get_edit)
router.post('/edit', jwt_validation, authModel.post_edit)

router.post('/track/user', jwt_validation, authModel.get_track_user)
router.post('/track/update', jwt_validation, authModel.update_track_user_location)

router.post('/location', authModel.getLocationData)


router.get('/check-token', jwt_validation, authModel.check_token)

module.exports = router