const sequelize = require('../config/sequelize')
const chatsModel = require('../Models/chats')

exports.getUserLocation = async (req, res, next) => {
    let receiver = req.type === 'users' ? 'agency' : req.type
    // let user_data = await sequelize.query(`
    //     (
    //         select a.id,a.username,a.image,a.phone,b.receiver_type as type, c.lat, c.long as lng
    //         from ${receiver} a 		
    //         inner join bookings b on a.id=b.receiver_id		
    //         left join cities c on a.city_id=c.id
    //         where b.id=${req.body.booking_id}
    //     )
    //     union all
    //     (
    //         select u.id,u.username,u.image,u.phone,'U' as type, c.lat, c.long as lng
    //         from users u
    //         inner join bookings b on u.id=b.sender_id		
    //         left join cities c on u.city_id=c.id
    //         where b.id=${req.body.booking_id}
    //     )
    // `)

    let user_data = await sequelize.query(`
        (
            select a.id,a.username,a.image,a.phone,a.lat,a.lng,b.receiver_type as type
            from ${receiver} a 		
            inner join bookings b on a.id=b.receiver_id		
            left join cities c on a.city_id=c.id
            where b.id=${req.body.booking_id}
        )
        union all
        (
            select u.id,u.username,u.image,u.phone,u.lat,u.lng,'U' as type
            from users u
            inner join bookings b on u.id=b.sender_id		
            left join cities c on u.city_id=c.id
            where b.id=${req.body.booking_id}
        )
    `)


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
    let last_message_query = ''
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

    let friend = await sequelize.query(`        
        (select x.id,x.username,x.image, '${receiver_code[0]}' as type from ${receiver_list[0]} x,(
            SELECT DISTINCT ON (receiver_id,sender_id) * FROM chats
            where receiver_id=${req.userId} and sender_type<>'${req.typeCode}' and sender_type<>'${receiver_code[1]}'
            ORDER BY sender_id
        ) as chats
        where chats.sender_id=x.id)
	    union all
		(select y.id,y.username,y.image, '${receiver_code[1]}' as type from ${receiver_list[1]} y,(
            SELECT DISTINCT ON (receiver_id,sender_id) * FROM chats
            where receiver_id=${req.userId} and sender_type<>'${req.typeCode}' and sender_type<>'${receiver_code[0]}'
            ORDER BY sender_id
        ) as chats
        where chats.sender_id=y.id) 
    `)


    friend = friend[0]

    for (let i = 0; i < friend.length; i++) {
        if (i === friend.length - 1) {
            last_message_query += `(
                SELECT * FROM chats
                where sender_id=${friend[i].id} and receiver_id=${req.userId} and sender_type='${friend[i].type}' or 
                sender_id=${req.userId} and receiver_id=${friend[i].id} and receiver_type='${friend[i].type}'                 
                ORDER BY "createdAt" desc
                limit 1
            )`
        } else {
            last_message_query += `(
                SELECT * FROM chats
                where sender_id=${friend[i].id} and receiver_id=${req.userId} and sender_type='${friend[i].type}' or 
                sender_id=${req.userId} and receiver_id=${friend[i].id} and receiver_type='${friend[i].type}'                 
                ORDER BY "createdAt" desc
                limit 1
            ) UNION ALL `
        }
    }

    let last_message = await sequelize.query(last_message_query)
    last_message = last_message[0]

    return res.status(200).json({
        data: friend,
        last_message: last_message,
        err: null
    })
}

exports.chatsData = async (req, res, next) => {
    const tours_data_query = req.body.tours_type === 'A' ?
        `select c.*, taa.title as tours_title, taa.image as tours_image, taa.cost as tours_cost
        from chats c 
        left join tours_agency_ads taa on taa.id=c.tours_id `
        :
        `select c.*, tga.title as tours_title, tga.image as tours_image, tga.cost as tours_cost
        from chats c 
        left join tours_guides_ads tga on tga.id=c.tours_id `

    const msg = await sequelize.query(`
    ${tours_data_query}
    where 
        (c.sender_id=${req.userId} AND c.receiver_id= ${req.body.receiver_id}) and (c.sender_type='${req.typeCode}' or c.receiver_type='${req.body.receiver_type}')
    OR
        (c.sender_id=${req.body.receiver_id} AND c.receiver_id= ${req.userId}) and (c.sender_type='${req.body.receiver_type}' or c.receiver_type='${req.typeCode}');
    `)

    // for (let i = 0; i < msg[0].length; i++) {
    //     if (msg[0][i].notification) {
    //         const products = await productModel.findOne({
    //             where: {
    //                 id: msg[0][i].notification
    //             }
    //         })

    //         msg[0][i].prod_data = products
    //     }
    // }

    return res.status(200).json({
        data: msg[0],
        err: null
    })

}

exports.chatsSend = async (req, res, next) => {
    req.body.sender_id = req.userId
    req.body.sender_type = req.typeCode
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