const bcrypt = require('bcrypt')
const { validationResult } = require('express-validator')
const userModel = require('../Models/user')
const fs = require('fs')


exports.PostRegister = async (req, res, next) => {
    const err = validationResult(req)
    if (err.errors.length > 0) {
        return res.status(200).json({
            err: err.errors[0].msg
        })
    }

    const user = await userModel.findOne({
        where: {
            email: req.body.email
        }
    })

    if (user) {
        return res.status(200).json({
            err: "Email has been registered!"
        })
    }

    req.body.password = await bcrypt.hash(req.body.password, 10)      

    await userModel.create(req.body)

    return res.status(200).json({
        status: 200,
        err: null
    })
}


exports.getEdit = async (req, res, next) => {
    const userId = req.userId

    const user = await userModel.findOne({
        where: {
            id: userId
        }
    })

    if (!user) {
        return res.status(200).json({
            err: "You are not authorized to this action!"
        })
    }

    return res.status(200).json({
        status: 200,
        data: user,
        err: null
    })
}

exports.postEdit = async (req, res, next) => {
    const userId = req.userId
    const user = await userModel.findOne({
        where: {
            id: userId
        }
    })

    if (!user) {
        return res.status(200).json({
            err: "You are not authorized to this action!"
        })
    }

    // Delete last user image
    if (req.body.images_to_delete) {
        fs.unlink('images/' + req.body.images_to_delete.split('images/')[1], (err) => err)
    }

    user.username = req.body.username
    user.email = req.body.email
    user.phone = req.body.phone
    user.country_id = req.body.country
    user.state_id = req.body.state
    user.city_id = req.body.city
    user.lat = req.body.lat
    user.lng = req.body.lng

    if (req.files[0]) {
        user.image = req.files[0].path
    }

    const update_user = user.save()

    if (!update_user) {
        return res.status(200).json({
            err: "Update Failed!"
        })
    }

    return res.status(200).json({
        status: 200,
        err: null
    })
}


