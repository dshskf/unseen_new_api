const express = require('express')
const router = express.Router()
const productController = require('../Controller/product')
const jwt_validation = require('../middleware/isAuth')

router.get('/fetch', productController.get_product)
router.post('/details', productController.get_product_detail)

/* -------------------------------- Dashboard ------------------------------- */

router.get('/dashboard', jwt_validation, productController.get_product_dashboard)//get dashboard product
router.post('/approval', jwt_validation, productController.get_approval_data)//get management data
router.post('/approval-update', jwt_validation, productController.update_approval)// update approval status

router.post('/add', jwt_validation, productController.add_product)//dashboard
router.post('/edit', jwt_validation, productController.edit_product)//dashboard
router.post('/detail', jwt_validation, productController.get_product_dashboard_detail)//dashboard
router.post('/delete', jwt_validation, productController.delete_product)//dashboard


/* -------------------------------- Features -------------------------------- */

router.post('/request', jwt_validation, productController.request_to_seller)// send request of product to seller
router.post('/friends', jwt_validation, productController.get_user_friends)// get friend list
router.post('/chats', jwt_validation, productController.add_chats)// add chats to db
router.post('/message', jwt_validation, productController.get_user_message)//fetch user message

module.exports = router