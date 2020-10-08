const express = require('express')
const router = express.Router()

const jwt_validation = require('../middleware/isAuth')
const guidesController = require('../Controller/guides')
const { validator } = require('../middleware/validator')

router.post('/register', validator.register, guidesController.PostRegister)

router.get('/edit', jwt_validation, guidesController.getEdit)
router.post('/edit', jwt_validation, guidesController.postEdit)


module.exports = router