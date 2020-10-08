const { body } = require('express-validator')

exports.validator = {
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