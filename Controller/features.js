const sequelize = require('../config/sequelize')
const chatsModel = require('../Models/chats')

exports.getUserLocation = async (req, res, next) => {
    let user_data = await sequelize.query(`
        select u.* from users u 
        inner join requests r on u.id=r.sender_id or u.id=r.receiver_id
        where r.id=${req.body.reqId}
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
    let user = await user_model.findOne({
        where: {
            id: req.body.userId
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

    if (req.body.type === 'U') {
        receiver_list = ['agencies', 'guides']
        receiver_code = ['A', 'G']
    } else if (req.body.type === 'A') {
        receiver_list = ['users', 'guides']
        receiver_code = ['U', 'G']
    } else if (req.body.type === 'G') {
        receiver_list = ['users', 'agencies']
        receiver_code = ['U', 'A']
    }
    
    let friend = await sequelize.query(`        
        (select x.id,x.username,x.image, '${receiver_code[0]}' as type from ${receiver_list[0]} x,(
            SELECT DISTINCT ON (receiver_id,sender_id) * FROM chats
            where receiver_id=${req.body.id} and sender_type<>'${req.body.type}' and sender_type<>'${receiver_code[1]}'
            ORDER BY sender_id
        ) as chats
        where chats.sender_id=x.id)
	    union all
		(select y.id,y.username,y.image, '${receiver_code[1]}' as type from ${receiver_list[1]} y,(
            SELECT DISTINCT ON (receiver_id,sender_id) * FROM chats
            where receiver_id=${req.body.id} and sender_type<>'${req.body.type}' and sender_type<>'${receiver_code[0]}'
            ORDER BY sender_id
        ) as chats
        where chats.sender_id=y.id) 
    `)
    

    friend = friend[0]
    console.log(friend)

    for (let i = 0; i < friend.length; i++) {
        if (i === friend.length - 1) {           
            last_message_query += `(
                SELECT * FROM chats
                where sender_id=${friend[i].id} and receiver_id=${req.body.id} and sender_type='${friend[i].type}' or 
                sender_id=${req.body.id} and receiver_id=${friend[i].id} and receiver_type='${friend[i].type}'                 
                ORDER BY "createdAt" desc
                limit 1
            )`
        } else {
            last_message_query += `(
                SELECT * FROM chats
                where sender_id=${friend[i].id} and receiver_id=${req.body.id} and sender_type='${friend[i].type}' or 
                sender_id=${req.body.id} and receiver_id=${friend[i].id} and receiver_type='${friend[i].type}'                 
                ORDER BY "createdAt" desc
                limit 1
            ) UNION ALL `
        }
    }

    let last_message = await sequelize.query(last_message_query)
    last_message = last_message[0]
    console.log(last_message)

    return res.status(200).json({
        data: friend,
        last_message: last_message,
        err: null
    })
}

exports.chatsData = async (req, res, next) => {    
    const msg = await sequelize.query(`
    select * from chats 
    where 
        (sender_id=${req.body.sender_id} AND receiver_id= ${req.body.receiver_id}) and (sender_type='${req.body.sender_type}' or receiver_type='${req.body.receiver_type}')
    OR
        (sender_id=${req.body.receiver_id} AND receiver_id= ${req.body.sender_id}) and (sender_type='${req.body.receiver_type}' or receiver_type='${req.body.sender_type}');
    `)    

    for (let i = 0; i < msg[0].length; i++) {
        if (msg[0][i].notification) {
            const products = await productModel.findOne({
                where: {
                    id: msg[0][i].notification
                }
            })

            msg[0][i].prod_data = products
        }
    }

    return res.status(200).json({
        data: msg[0],
        err: null
    })

}

exports.chatsSend = async (req, res, next) => {
    const post_chat = await chatsModel.create(req.body);

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
    }
    else if (req.body.action === "countries") {
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
