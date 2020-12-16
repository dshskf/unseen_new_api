const sequelize = require('../config/sequelize')
const { Op } = require('sequelize')
const chatsModel = require('../Models/chats')
const lastChatsModel = require('../Models/chats_last')

exports.getUserLocation = async (req, res, next) => {   
    let user_data = null
    if (req.body.reqType === 'bookings') {
        user_data = await sequelize.query(`
            (
                select x.id,x.username,x.image,x.phone,x.lat,x.lng, 'A' as type 
                from agency x
                inner join (
                    select receiver_id from bookings where id= ${req.body.id} limit 1
                ) req on x.id=req.receiver_id 
                limit 1
            )
            union all
            (
                select x.id,x.username,x.image,x.phone,x.lat,x.lng, 'U' as type 
                from users x
                inner join (
                    select sender_id from bookings where id= ${req.body.id} limit 1
                ) req on x.id=req.sender_id 
                limit 1
            )
        `)
    } else if (req.body.reqType === 'requests') {
        user_data = await sequelize.query(`
            (
                select id,username,image,phone,lat,lng, 'G' as type 
                from guides x
                inner join (
                    select receiver_id from requests where id=${req.body.id} limit 1
                ) req on id=req.receiver_id 
                limit 1
            )
            union all
            (
                select id,username,image,phone,lat,lng, 'U' as type 
                from users x
                inner join (
                    select sender_id,sender_type from requests where id=${req.body.id} limit 1
                ) req on id=req.sender_id and req.sender_type='U'
                limit 1
            )
            union all
            (
                select id,username,image,phone,lat,lng, 'A' as type 
                from agency x
                inner join (
                    select sender_id,sender_type from requests where id=${req.body.id} limit 1
                ) req on id=req.sender_id and req.sender_type='A'
                limit 1
            )
        `)
    }

    if (!user_data) {
        return res.status(200).json({
            err: `Can't find another user!`
        })
    }

    return res.status(200).json({
        data: user_data[0],
        err: null
    })
}

exports.updateUserLocation = async (req, res, next) => {
    let user = await req.userModel.findOne({
        where: {
            id: req.userId
        }
    })

    if (!user) {
        return res.status(200).json({
            err: `Can't find user!`
        })
    }

    user.lat = req.body.lat
    user.lng = req.body.lng

    await user.save()

    return res.status(200).json({
        status: 200,
        err: null
    })

}

exports.chatsPerson = async (req, res, next) => {
    let receiver_list, receiver_code

    if (req.typeCode === 'U') {
        receiver_list = ['agency', 'guides']
        receiver_code = ['A', 'G']
    } else if (req.typeCode === 'A') {
        receiver_list = ['users', 'guides']
        receiver_code = ['U', 'G']
    } else if (req.typeCode === 'G') {
        receiver_list = ['users', 'agency']
        receiver_code = ['U', 'A']
    }

    let friends = await sequelize.query(`
    (
        select distinct on(x.id) x.id,x.username,x.image, '${receiver_code[0]}' as type, cl.content
        from ${receiver_list[0]} x
        inner join chats_lasts cl on 
            (cl.sender_id=x.id and cl.sender_type='${receiver_code[0]}' and cl.receiver_id=${req.userId} and cl.receiver_type='${req.typeCode}') or
            (cl.sender_type='${req.typeCode}' and cl.sender_id=${req.userId} and cl.receiver_id=x.id and cl.receiver_type='${receiver_code[0]}')
    )
    union all
    (
        select distinct on(x.id) x.id,x.username,x.image,'${receiver_code[1]}' as type, cl.content
        from ${receiver_list[1]} x
        inner join chats_lasts cl on 
            (cl.sender_id=x.id and cl.sender_type='${receiver_code[1]}' and cl.receiver_id=${req.userId} and cl.receiver_type='${req.typeCode}') or
            (cl.sender_type='${req.typeCode}' and cl.sender_id=${req.userId} and cl.receiver_id=x.id and cl.receiver_type='${receiver_code[1]}')
    )
    `)
    friends = friends[0]

    return res.status(200).json({
        data: friends,
        err: null
    })
}

exports.chatsData = async (req, res, next) => {
    let tours_data_query

    // If user then change to the sender_type
    if (req.body.receiver_type === 'U') {
        req.body.tours_type = req.body.sender_type
    }

    if (req.body.tours_type === 'A') {
        tours_data_query = `
            select c.*, taa.title as tours_title, taa.image as tours_image, taa.cost as tours_cost
            from chats c 
            left join tours_agency_ads taa on taa.id=c.tours_id             
        `
    } else {
        tours_data_query = `
            select c.*
            from chats c 
        `
    }

    const msg = await sequelize.query(`
        ${tours_data_query}
        where 
            (c.sender_id=${req.userId} and c.sender_type='${req.typeCode}' and c.receiver_id= ${req.body.receiver_id} and c.receiver_type='${req.body.receiver_type}')
            OR
            (c.sender_id=${req.body.receiver_id} and c.sender_type='${req.body.receiver_type}' and c.receiver_id= ${req.userId} and c.receiver_type='${req.typeCode}')
        order by c."createdAt"
    `)

    return res.status(200).json({
        data: msg[0],
        err: null
    })

}

exports.chatsSend = async (req, res, next) => {
    req.body.sender_id = req.userId
    req.body.sender_type = req.typeCode

    let last_chat = await lastChatsModel.findOne({
        where: {
            [Op.or]: [
                {
                    [Op.and]: {
                        sender_id: req.body.sender_id,
                        sender_type: req.body.sender_type,
                        receiver_id: req.body.receiver_id,
                        receiver_type: req.body.receiver_type,
                    }
                },
                {
                    [Op.and]: {
                        sender_id: req.body.receiver_id,
                        sender_type: req.body.receiver_type,
                        receiver_id: req.body.sender_id,
                        receiver_type: req.body.sender_type,
                    }
                }
            ]
        }
    })

    if (!last_chat) {
        await lastChatsModel.create(req.body)
    } else {
        last_chat.content = req.body.content
        await last_chat.save()
    }

    const post_chat = await chatsModel.create(req.body);

    if (!post_chat) {
        return res.status(200).json({
            err: `Can't send message!`
        })
    }

    return res.status(200).json({
        msg: "success",
        err: null
    })
}


exports.getLocationData = async (req, res, next) => {
    let query
    if (req.body.action === "fetch_data") {
        query = `
            select co.id as country_id, co.name as country_name,s.id as state_id,
            s.name as state_name,cy.id as city_id,cy.name as city_name,cy.lat,cy.long
            from countries co
            inner join states s on s.country_id = co.id
            inner join cities cy on cy.state_id =s.id
            where cy.id=${req.body.cities_id};
        `
    } else if (req.body.action === "countries") {
        query = `select c.id as val, c.name as label from countries c`
    } else if (req.body.action === "states") {
        query = `select s.id as val, s.name as label from states s where country_id = ${req.body.countries_id}`
    } else {
        query = `select c.id as val, c.name as label, c.lat, c.long from cities c where state_id = ${req.body.states_id}`
    }

    let location = await sequelize.query(query)

    return res.status(200).json({
        data: location[0],
        err: null
    })
}