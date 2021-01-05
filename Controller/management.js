const sequelize = require('../config/sequelize')
const requestModel = require('../Models/request')
const bookingModel = require('../Models/booking')
const toursAgencyModel = require('../Models/tours-agency')

// ANCHOR Get Request

exports.get_request = async (req, res, next) => {
    if (req.body.type === 'G') {
        this.get_request_guides(req, res)
    } else {
        this.get_request_customer(req, res)
    }
}

exports.get_request_guides = async (req, res) => {
    let offset, limit
    if (req.body.is_mobile) {
        offset = 0
        limit = req.body.page * 8
    } else {
        offset = (req.body.page - 1) * 8
        limit = 8
    }
    let customer = await sequelize.query(`
        select r.*,users.*,agency.*
        from requests r
        left join (
            select id as users_id, username as users_name, phone as users_phone,
                email as users_email, image as users_image
            from users
        ) users on r.sender_id = users.users_id and users.users_id is not null and r.sender_type='U' 
        left join (
            select id as agency_id, username as agency_name, phone as agency_phone,
                email as agency_email, image as agency_image
            from agency
        ) agency on r.sender_id = agency.agency_id and agency.agency_id is not null and r.sender_type='A'     
        where r.receiver_id=${req.userId}
        limit ${limit} offset ${offset}
    `)

    if (!customer) {
        return res.status(200).json({
            err: "Can't find request data!"
        })
    }


    let total_page = await sequelize.query(`select count(*) from requests where receiver_id=${req.userId}`)
    total_page = Math.ceil(total_page[0][0].count / 8)

    return res.status(200).json({
        data: customer[0],
        total_page: total_page,
        err: null
    })
}

exports.get_request_customer = async (req, res) => {
    let request = await sequelize.query(`
        select r.*, g.id as guides_id, g.username as guides_name, g.image as guides_image, g.email as guides_email
        from requests r
        inner join guides g on r.receiver_id=g.id
        where sender_id=${req.userId} and sender_type='${req.body.type}'
    `)

    if (!request) {
        return res.status(200).json({
            err: "Can't find request data!"
        })
    }

    let total_page = await sequelize.query(`select count(*) from requests where receiver_id=${req.userId}`)
    total_page = Math.ceil(total_page[0][0].count / 8)
    
    return res.status(200).json({
        data: request[0],
        total_page: total_page,
        err: null
    })
}

// ANCHOR Update Request

exports.update_request = async (req, res, next) => {
    const request = await requestModel.findOne({
        where: {
            id: req.body.request_id
        }
    })
    if (!request) {
        return res.status(200).json({ err: 'Request not found!' })
    }

    if (req.body.action === 'update') {
        if (!request.is_approve) request.is_approve = true
        else if (request.is_approve && !request.is_payed) request.is_payed = true
        else if (request.is_approve && request.is_payed && !request.is_active) request.is_active = true
        else {
            return res.status(200).json({ err: 'Invalid request data!' })
        }

        await request.save()
    } else if (req.body.action === 'delete') {
        await request.destroy()
    } else {
        return res.status(200).json({ err: 'Error method!' })
    }

    return res.status(200).json({
        msg: "Success",
        err: null
    })
}

exports.get_booking_user = async (req, res, next) => {
    let offset, limit
    if (req.body.is_mobile) {
        offset = 0
        limit = req.body.page * 8
    } else {
        offset = (req.body.page - 1) * 8
        limit = 8
    }

    let sender_data = await sequelize.query(`
        select b.*, 
        taa.id as ads_id, taa.title as ads_title, taa.image as ads_image, taa.cost as ads_price, taa.start_date as ads_start_date,
        taa.end_date as ads_end_date, a.id as agency_id, a.username as agency_username, a.rating as agency_rating,u.username as user_username
        from bookings b
        inner join tours_agency_ads taa on b.tours_id=taa.id
        inner join agency a on b.receiver_id = a.id
        inner join users u on u.id=b.sender_id
        where b.sender_id=${req.userId}
        limit ${limit} offset ${offset}
    `)

    let total_page = await sequelize.query(`select count(*) from bookings where sender_id=${req.userId}`)
    total_page = Math.ceil(total_page[0][0].count / 8)

    return res.status(200).json({
        data: sender_data[0],
        total_page: total_page,
        err: null
    })
}

// ANCHOR Get Booking

exports.get_booking_agency = async (req, res, next) => {
    let offset, limit
    if (req.body.is_mobile) {
        offset = 0
        limit = req.body.page * 8
    } else {
        offset = (req.body.page - 1) * 8
        limit = 8
    }

    let booking_data = await sequelize.query(`
        select b.*, 
        taa.id as ads_id, taa.title as ads_title, taa.image as ads_image, taa.cost as ads_price, taa.start_date as ads_start_date,
        taa.end_date as ads_end_date, u.id as user_id, u.username as user_username, u.email as user_email, u.phone as user_phone, a.username as agency_username
        from bookings b
        inner join tours_agency_ads taa on b.tours_id=taa.id
        inner join users u on b.sender_id = u.id
        inner join agency a on a.id = b.receiver_id
        where b.receiver_id=${req.userId}
        limit ${limit} offset ${offset}
    `)

    let total_page = await sequelize.query(`select count(*) from bookings where sender_id=${req.userId}`)
    total_page = Math.ceil(total_page[0][0].count / 8)

    return res.status(200).json({
        data: booking_data[0],
        total_page: total_page,
        err: null
    })
}

// ANCHOR Update Bookings

exports.update_booking_agency = async (req, res, next) => {
    const req_booking = await bookingModel.findOne({
        where: {
            id: req.body.booking_id
        }
    })

    if (!req_booking) {
        return res.status(200).json({
            err: "Can't find Bookings data!"
        })
    }

    if (req.body.action === 'update') {
        req_booking.is_active = 1
        await req_booking.save()
    }
    else {
        await req_booking.destroy();
    }

    return res.status(200).json({
        msg: "Success",
        err: null
    })
}

exports.update_booking_user = async (req, res, next) => {
    const req_booking = await bookingModel.findOne({
        where: {
            id: req.body.booking_id
        }
    })

    if (!req_booking) {
        return res.status(200).json({
            err: "Can't find Booking data!"
        })
    }

    if (req.body.action === 'update') {
        const req_tours = await toursAgencyModel.findOne({
            where: {
                id: req.body.tours_id
            }
        })

        if (!req_tours) {
            return res.status(200).json({
                err: "Can't find Tours data!"
            })
        }

        req_booking.is_payed = 1
        req_tours.quota_left = req_tours.quota_left - 1

        await req_booking.save()
        await req_tours.save()
    }
    else {
        await req_booking.destroy();
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