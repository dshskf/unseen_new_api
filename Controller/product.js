const product_model = require('../Models/product')
const request_model = require('../Models/request')
const chats_model = require('../Models/chats')
const user_model = require('../Models/user')
const comment_model = require('../Models/comment')

const sequelize = require('../config')
const { Op } = require('sequelize')
const fs = require('fs')


exports.add_product = async (req, res, next) => {
    let images = []

    req.files.map(data => {
        images.push(data.path)
    })

    const now = new Date(Date.now())
    const start = new Date(req.body.start_date)

    if (now > start) {
        return res.status(200).json({
            err: "Date not valid!"
        })
    }

    req.body.status = 'Active'
    req.body.userId = req.userId
    req.body.image = images

    const product = await product_model.create(req.body)

    return res.status(200).json({
        msg: "Success",
        err: null
    })
}


exports.get_product = async (req, res, next) => {
    const product = await sequelize.query(`
        select p.id,p.title,p.cost,p.destination, p.start_date,p.rating,p.image, u.id as userId,u.username 
        from products p 
        join users u on p."userId"=u.id
        ORDER BY random()
        limit 10
    `)

    return res.status(200).json({
        product: product[0],
        err: null
    })
}

exports.get_product_detail = async (req, res, next) => {
    const product = await sequelize.query(`
        select p.* , u.id,u.username, u.image as user_image
        from products p
        join users u on u.id=p."userId"
        where p.id=${req.body.id};
    `)

    const comment = await sequelize.query(`
        select p.id,c.comment,c.rating,u.username,u.image
        from products p
        join comments c on p.id=c.product_id
        join users u on u.id=c.sender_id
        where p.id=${req.body.id};
    `)

    return res.status(200).json({
        product: product[0],
        comment: comment[0],
        err: null
    })
}

exports.get_product_dashboard = async (req, res, next) => {
    const product = await product_model.findAll({
        where: {
            userId: req.userId
        }
    })

    if (!product) {
        return res.status(200).json({
            err: 'No Product!'
        })
    }

    return res.status(200).json({
        product: product,
        err: null
    })
}

exports.get_product_dashboard_detail = async (req, res, next) => {
    const product = await product_model.findOne({
        where: {
            id: req.body.id
        }
    })
    return res.status(200).json({
        product: product,
        err: null
    })
}

exports.edit_product = async (req, res, next) => {
    let filter_image
    let files

    if (req.body.img_del) {
        filter_image = req.body.img_path.filter(data => {
            let isDel = false

            isDel = req.body.img_del.map((del_data, index) => {
                if (data === del_data) {
                    if (isDel === false) {
                        fs.unlink('images/' + del_data.split('images/')[1], (err) => console.log(err))
                        return true
                    }
                }
            }).filter(del_data => del_data === true)

            if (isDel[0] !== true) {
                return data
            }
        })

        filter_image = filter_image.map(data => `images\\${data.split('images/')[1]}`)

        files = req.files.map(data => data.path)
        files = filter_image.concat(files)


    }


    const b = req.body

    let products = await product_model.findOne({
        where: {
            id: b.id
        }
    })

    if (!products) {
        return res.status(200).json({
            err: "Product Not found!!!"
        })

    }

    products.title = b.title;
    products.cost = b.cost;
    products.destination = b.destination;
    products.description = b.description;
    products.start_date = b.start_date;
    products.end_date = b.end_date;

    if (req.body.img_del) {
        products.image = files;
    }

    await products.save()

    return res.status(200).json({
        msg: "Success!",
        err: null
    })

}

exports.delete_product = async (req, res, next) => {
    const prod = await product_model.findOne({
        where: {
            id: req.body.id
        }
    })

    if (!prod) {
        return res.status(200).json({
            err: "Product not found!"
        })
    }

    prod.image.map(data => {
        const paths = data.replace('\\', '/')
        fs.unlink(paths, (err) => console.log(err))
    })

    await prod.destroy({
        where: {
            id: req.body.id
        }
    })

    return res.status(200).json({
        msg: "Success!",
        err: null
    })
}


exports.request_to_seller = async (req, res, next) => {
    if (req.body.sender_id === req.body.receiver_id) {
        return res.status(200).json({
            err: "You're the owner of this!"
        })
    }

    const check = await request_model.findOne({
        where: {
            sender_id: req.body.sender_id,
            product_id: req.body.product_id
        }
    })

    if (check) {
        return res.status(200).json({
            err: "You already requset for this!"
        })
    }

    req.body.offers_price = parseFloat(req.body.offers_price)

    const request = await request_model.create(req.body)
    if (!request) {
        return res.status(200).json({
            err: "Cant add request!"
        })
    }

    return res.status(200).json({
        msg: "Success",
        err: null
    })
}

exports.get_user_friends = async (req, res, next) => {
    let last_message_query = ''

    let friend = await sequelize.query(`
        select u.* from users u,(
            SELECT DISTINCT ON (receiver_id,sender_id) * FROM chats
            where sender_id<>${req.body.id} and receiver_id=${req.body.id}
            ORDER BY sender_id
        ) as chats
        where chats.sender_id=u.id   
    `)
    friend = friend[0]

    for (let i = 0; i < friend.length; i++) {
        if (i === friend.length - 1) {
            last_message_query += `(
                SELECT * FROM chats
                where sender_id=${friend[i].id} and receiver_id=${req.body.id} or 
                sender_id=${req.body.id} and receiver_id=${friend[i].id}                
                ORDER BY "createdAt" desc
                limit 1
            )`
        } else {
            last_message_query += `(
                SELECT * FROM chats
                where sender_id=${friend[i].id} and receiver_id=${req.body.id} or 
                sender_id=${req.body.id} and receiver_id=${friend[i].id}                
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

exports.get_user_message = async (req, res, next) => {


    const msg = await sequelize.query(`
    select * from chats 
    where 
        (sender_id=${req.body.sender_id} AND receiver_id= ${req.body.receiver_id})
    OR
        (sender_id=${req.body.receiver_id} AND receiver_id= ${req.body.sender_id});
    `)

    for (let i = 0; i < msg[0].length; i++) {
        if (msg[0][i].notification) {
            const products = await product_model.findOne({
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

exports.add_chats = async (req, res, next) => {

    const post_chat = await chats_model.create(req.body);

    return res.status(200).json({
        msg: "success",
        err: null
    })
}

exports.get_approval_data = async (req, res, next) => {
    const q = req.body.action === "sender_id" ? "receiver_id" : "sender_id"

    let sender_data = await sequelize.query(`
        select r.id,r.sender_id,r.receiver_id,r."isApprove",r."isPaying",r."isActive",r.offers_price,r.reason,
        u.username,u.phone,u.email,p.id as product_id,p.title as product_name,p.start_date
        from requests r
        join users u on r.${q}=u.id
        join products p on r.product_id=p.id
        where r.${req.body.action}=${req.userId}
    `)

    return res.status(200).json({
        data: sender_data[0],
        err: null
    })
}


exports.update_approval = async (req, res, next) => {
    const req_data = await request_model.findOne({
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