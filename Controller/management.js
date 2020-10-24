const sequelize = require('../config/sequelize')
const requestModel = require('../Models/request')
const bookingModel = require('../Models/booking')

exports.get_booking_guides = async (req, res, next) => {
    const q = req.body.action === "sender_id" ? "receiver_id" : "sender_id"
    let sender_data = await sequelize.query(`
        select b.*, 
        taa.id as ads_id, taa.title as ads_title,  taa.image as ads_image,
        a.id as agency_id, a.username as agency_username, a.rating as agency_rating
        from bookings b
        join tours_agency_ads taa on b.tours_id=taa.id
        join agency a on b.receiver_id = a.id
        where b.${req.body.action}=${req.userId} and receiver_type='A'
    `)

    return res.status(200).json({
        data: sender_data[0],
        err: null
    })
}

exports.get_booking_agency = async (req, res, next) => {
    let booking_data = await sequelize.query(`
        select b.*, 
        taa.id as ads_id, taa.title as ads_title, taa.image as ads_image, taa.cost as ads_price, taa.start_date as ads_start_date,
        u.id as user_id, u.username as user_username, u.email as user_email, u.phone as user_phone
        from bookings b
        join tours_agency_ads taa on b.tours_id=taa.id
        join users u on b.sender_id = u.id
        where b.receiver_id=${req.userId} and receiver_type='A'
    `)

    return res.status(200).json({
        data: booking_data[0],
        err: null
    })
}

exports.update_booking_agency = async (req, res, next) => {
    const req_data = await bookingModel.findOne({
        where: {
            id: req.body.request_id
        }
    })    

    if (!req_data) {
        return res.status(200).json({
            err: "Can't find Bookings data!"
        })
    }

    if (req.body.action === 'update') {
        req_data.is_active = 1
        await req_data.save()
    }
    else {
        await req_data.destroy();
    }

    return res.status(200).json({
        msg: "Success",
        err: null
    })
}




exports.get_booking_user = async (req, res, next) => {
    let sender_data = await sequelize.query(`
        select b.*, 
        taa.id as ads_id, taa.title as ads_title, taa.image as ads_image, taa.cost as ads_price, taa.start_date as ads_start_date,
        a.id as agency_id, a.username as agency_username, a.rating as agency_rating
        from bookings b
        join tours_agency_ads taa on b.tours_id=taa.id
        join agency a on b.receiver_id = a.id
        where b.sender_id=${req.userId} and receiver_type='A'
    `)

    return res.status(200).json({
        data: sender_data[0],
        err: null
    })
}

exports.update_booking_user = async (req, res, next) => {
    const req_data = await bookingModel.findOne({
        where: {
            id: req.body.request_id
        }
    })

    if (!req_data) {
        return res.status(200).json({
            err: "Can't find Bookings data!"
        })
    }

    if (req.body.action === 'update') {
        req_data.is_payed = 1
        await req_data.save()
    }
    else {
        await req_data.destroy();
    }

    return res.status(200).json({
        msg: "Success",
        err: null
    })
}



exports.update_booking = async (req, res, next) => {
    const req_data = await requestModel.findOne({
        where: {
            id: req.body.request_id
        }
    })

    if (!req_data) {
        return res.status(200).json({
            err: "Can't find request to update or delete!"
        })
    }

    if (req.body.action === 'update') {

        if (req.body.on === 'isApprove') {
            req_data.isApprove = 1
        }
        else if (req.body.on === 'isPaying') {
            req_data.isPaying = 1
        }
        else {
            req_data.isActive = 1
        }

        await req_data.save()
    }
    else { //Delete
        await req_data.destroy();
    }

    return res.status(200).json({
        msg: "Success",
        err: null
    })
}