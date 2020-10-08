const express = require('express')
const router = express.Router()

const jwt_validation = require('../middleware/isAuth')
const featuresController = require('../Controller/features')

// Tracking
router.post('/track', jwt_validation, featuresController.getUserLocation)
router.post('/track/update', jwt_validation, featuresController.updateUserLocation)

// Chats
router.post('/chats', jwt_validation, featuresController.chatsData)//fetch chat message
router.post('/chats/list', jwt_validation, featuresController.chatsPerson)// get friend list
router.post('/chats/send', jwt_validation, featuresController.chatsSend)// add chats to db

router.post('/location', featuresController.getLocationData)


module.exports = router