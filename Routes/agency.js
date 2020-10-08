const express = require('express')
const router = express.Router()

const jwt_validation = require('../middleware/isAuth')
const agencyController = require('../Controller/agency')
const { validator } = require('../middleware/validator')

router.post('/register', validator.register, agencyController.PostRegister)

router.get('/edit', jwt_validation, agencyController.getEdit)
router.post('/edit', jwt_validation, agencyController.postEdit)

module.exports = router