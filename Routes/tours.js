const express = require('express')
const router = express.Router()
const productController = require('../Controller/tours')
const jwt_validation = require('../middleware/isAuth')
const model_selection = require('../middleware/model')

router.post('/guides', productController.get_tours_guides)
router.post('/agency', productController.get_tours_agency)

router.post('/request', jwt_validation, productController.request_to_seller)// send request of product to seller
router.post('/booking', jwt_validation, productController.booking_tours)

router.get('/booking-list', jwt_validation, productController.get_booking_list)
router.post('/request/agency', jwt_validation, productController.post_agency_request)

router.post('/guides/details', productController.get_tours_guides_detail)
router.post('/agency/details', productController.get_tours_agency_detail)

router.get('/dashboard', jwt_validation, model_selection, productController.get_tours_dashboard)//get dashboard product
router.post('/dashboard/details', jwt_validation, model_selection, productController.get_tours_dashboard_detail)//dashboard

router.post('/dashboard/add', jwt_validation, model_selection, productController.add_tours)//dashboard
router.post('/dashboard/edit', jwt_validation, model_selection, productController.edit_tours)//dashboard
router.post('/dashboard/delete', jwt_validation, model_selection, productController.delete_tours)//dashboard

router.post('/comments/bookings', jwt_validation, productController.send_comments_booking)
router.post('/comments/requests', jwt_validation, productController.send_comments_requests)

module.exports = router