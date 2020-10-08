const express = require('express')
const router = express.Router()

const jwt_validation = require('../middleware/isAuth')
const userController = require('../Controller/user')
const { validator } = require('../middleware/validator')

router.post('/register', validator.register, userController.PostRegister)

router.get('/edit', jwt_validation, userController.getEdit)
router.post('/edit', jwt_validation, userController.postEdit)

module.exports = router