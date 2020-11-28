const express = require('express')
const router = express.Router()
const managementController = require('../Controller/management')
const jwt_validation = require('../middleware/isAuth')

router.post('/guides', jwt_validation, managementController.get_request)
router.post('/agency', jwt_validation, managementController.get_booking_agency)
router.post('/user', jwt_validation, managementController.get_booking_user)

router.post('/guides/update', jwt_validation, managementController.update_request)
router.post('/agency/update', jwt_validation, managementController.update_booking_agency)
router.post('/user/update', jwt_validation, managementController.update_booking_user)


module.exports = router
