const toursAgencyModel = require('../Models/tours-agency')
const toursGuidesModel = require('../Models/tours-guides')
const bookingModel = require('../Models/booking')
const requestModel = require('../Models/request')
const sequelize = require('../config/sequelize')
const fs = require('fs')

const matchObjects = (data, dest) => {
    let temp = []
    temp = data.map(t => {
        t.destination = dest.filter(d => d.tours_id === t.id)
        return t
    })

    return temp
}

exports.get_tours_guides = async (req, res, next) => {
    let offset, limit
    if (req.body.is_mobile) {
        offset = 0
        limit = req.body.page * 12
    } else {
        offset = (req.body.page - 1) * 12
        limit = 12
    }

    let tours = await sequelize.query(`
        SELECT g.id,g.username,g.cost,g.rating,g.total_tours,g.image,c.name as country
        FROM guides g 
        JOIN countries c on g.country_id=c.id
        Limit ${limit} offset ${offset}     
    `)
    let total_page = await sequelize.query(`select count(*) from guides`)

    total_page = Math.ceil(total_page[0][0].count / 12)
    tours = tours[0]

    return res.status(200).json({
        tours: tours,
        total_page: total_page,
        err: null
    })
}

exports.get_tours_agency = async (req, res, next) => {    
    let offset, limit
    if (req.body.is_mobile) {
        offset = 0
        limit = req.body.page * 12
    } else {
        offset = (req.body.page - 1) * 12
        limit = 12
    }


    let tours = await sequelize.query(`
        SELECT t.id,t.title,t.cost, t.start_date, t.rating,t.image, a.id as agencyId,a.username
        FROM tours_agency_ads t 
        JOIN agency a on t."agencyId"=a.id
        limit ${limit} offset ${offset}                  
    `)
    tours = tours[0]

    let destQuery = `select d.tours_id, c.name
        from destinations d
        join cities c on d.city_id=c.id
        where d."isGuides" = false and (  
    `

    tours.map((t, i) => {
        destQuery += i < tours.length - 1 ?
            `d.tours_id=${t.id} or `
            :
            `d.tours_id=${t.id})`
    })

    let destination = await sequelize.query(destQuery)
    destination = destination[0]

    tours = matchObjects(tours, destination)

    let total_page = await sequelize.query(`select count(*) from tours_agency_ads`)
    total_page = Math.ceil(total_page[0][0].count / 12)


    return res.status(200).json({
        tours: tours,
        total_page: total_page,
        err: null
    })
}

exports.get_tours_guides_detail = async (req, res, next) => {
    const product = await sequelize.query(`
        SELECT t.*, g.username, g.image as guides_images
        FROM tours_guides_ads t
        JOIN guides g on g.id=t."guideId"
        where t.id=${req.body.id};
    `)


    // const comment = await sequelize.query(`
    //     SELECT p.id,c.comment,c.rating,u.username,u.image
    //     FROM products p
    //     JOIN comments c on p.id=c.product_id
    //     JOIN users u on u.id=c.sender_id
    //     where p.id=${req.body.id};
    // `)

    return res.status(200).json({
        product: product[0],
        // comment: comment[0],
        err: null
    })
}

exports.get_tours_agency_detail = async (req, res, next) => {
    const tours = await sequelize.query(`
        SELECT t.*, a.username, a.image as agency_images, c.name as city_name
        FROM tours_agency_ads t
        inner JOIN agency a on a.id=t."agencyId"
        inner join destinations d on d.tours_id=t.id
        inner join cities c on c.id=d.city_id
        where t.id=${req.body.id};
    `)



    // const comment = await sequelize.query(`
    //     SELECT p.id,c.comment,c.rating,u.username,u.image
    //     FROM products p
    //     JOIN comments c on p.id=c.product_id
    //     JOIN users u on u.id=c.sender_id
    //     where p.id=${req.body.id};
    // `)

    return res.status(200).json({
        tours: tours[0],
        // comment: comment[0],
        err: null
    })
}


exports.get_tours_dashboard = async (req, res, next) => {
    const tours = await req.toursModel.findAll({
        where: {
            [`${req.type}Id`]: req.userId
        }
    })


    if (!tours) {
        return res.status(200).json({
            err: 'No Tours!'
        })
    }

    return res.status(200).json({
        tours: tours,
        err: null
    })
}

exports.get_tours_dashboard_detail = async (req, res, next) => {
    let model

    if (req.type === "agency") {
        model = 'tours_agency_ads'
    } else if (req.type === 'guides') {
        model = 'tours_guides_ads'
    }

    let tours = await sequelize.query(`
        select tga.*,d.id as destination_id,d.period,c.id as city_id, c.name as city from ${model} tga
        join destinations d on tga.id=d.tours_id
        join cities c on c.id=d.city_id
        where tga.id=${req.body.id} and d."isGuides"=${req.isGuides}
    `)
    if (tours[0].length < 1) {
        tours = await sequelize.query(`select * from ${model} where id=${req.body.id}`)
    }

    tours = tours[0]

    if (!tours) {
        return res.status(200).json({
            err: 'No Tours!'
        })
    }
    return res.status(200).json({
        tours: tours,
        err: null
    })
}

const insertDestinationQuery = (destination) => {
    let destQuery = `insert into destinations(tours_id,"isGuides",country_id,state_id,city_id,period,"createdAt","updatedAt") values `

    destination.map((d, index) => {
        if (index < destination.length - 1) {
            destQuery += `(${d.tours_id}, ${d.isGuides}, ${d.country_id},${d.state_id},${d.city_id},${d.period},now(),now()),`
        } else {
            destQuery += `(${d.tours_id}, ${d.isGuides}, ${d.country_id},${d.state_id},${d.city_id},${d.period},now(),now())`
        }
    })

    return destQuery
}

exports.add_tours = async (req, res, next) => {
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

    req.body.isActive = true
    req.body.image = images

    if (req.type === "agency") {
        req.body.agencyId = req.userId

    } else {
        req.body.guideId = req.userId
    }

    let post = await req.toursModel.create(req.body)
    post = post.dataValues.id


    // Insert Destination
    let dest = JSON.parse(req.body.destination)

    if (dest.length > 0) {
        dest = dest.map(d => ({ ...d, tours_id: post }))
        let destQuery = insertDestinationQuery(dest)
        await sequelize.query(destQuery)
    }


    return res.status(200).json({
        msg: "Success",
        err: null
    })
}

exports.edit_tours = async (req, res, next) => {
    let filter_image
    let files

    // Find and delete Image
    if (req.body.img_del) {
        filter_image = req.body.img_path.filter(data => {
            let isDel = false

            isDel = req.body.img_del.map((del_data, index) => {
                if (data === del_data) {
                    if (isDel === false) {
                        fs.unlink('images/' + del_data.split('images/')[1], (err) => err)
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

    // Update data in Postgre
    const body = req.body

    let tours = await req.toursModel.findOne({
        where: {
            id: body.id
        }
    })

    if (!tours) {
        return res.status(200).json({
            err: "Product Not found!!!"
        })

    }

    tours.title = body.title;
    tours.cost = body.cost;
    tours.description = body.description;
    tours.start_date = body.start_date;
    tours.end_date = body.end_date;
    tours.quota = body.quota;
    tours.quota_left = body.quota;

    if (req.body.img_del) {
        tours.image = files;
    }

    await tours.save()

    // Insert New Destination    
    if (JSON.parse(body.destination).length > 0) {
        let query = insertDestinationQuery(JSON.parse(body.destination))
        await sequelize.query(query)
    }


    // Delete Removed Destination
    if (body.removed_destination) {
        let query = `DELETE FROM destinations WHERE `

        body.removed_destination.map((data, index) => {
            if (index < body.removed_destination.length - 1) {
                query += `id=${data} or `
            } else {
                query += `id=${data}`
            }
        })

        await sequelize.query(query)
    }

    return res.status(200).json({
        msg: "Success!",
        err: null
    })

}

exports.delete_tours = async (req, res, next) => {
    const tours = await req.toursModel.findOne({
        where: {
            id: req.body.id
        }
    })

    if (!tours) {
        return res.status(200).json({
            err: "tours not found!"
        })
    }

    // Delete Destination
    if (req.body.removed_destination.length > 0) {
        let query = `DELETE FROM destinations WHERE `

        req.body.removed_destination.map((data, index) => {
            if (index < req.body.removed_destination.length - 1) {
                query += `id=${data} or `
            } else {
                query += `id=${data}`
            }
        })

        await sequelize.query(query)
    }

    tours.image.map(data => {
        const paths = data.replace('\\', '/')
        fs.unlink(paths, (err) => console.log(err))
    })


    await tours.destroy({
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
    // if (req.body.sender_id === req.body.receiver_id) {
    //     return res.status(200).json({
    //         err: "You're the owner of this!"
    //     })
    // }

    const check = await requestModel.findOne({
        where: {
            sender_id: req.body.sender_id,
            tours_id: req.body.tours_id
        }
    })

    if (check) {
        return res.status(200).json({
            err: "You already requset for this!"
        })
    }

    req.body.offers_price = parseFloat(req.body.offers_price)

    const request = await requestModel.create(req.body)
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

exports.booking_tours = async (req, res, next) => {
    const check = await bookingModel.findOne({
        where: {
            sender_id: req.body.sender_id,
            tours_id: req.body.tours_id,
            receiver_type: req.body.receiver_type
        }
    })

    if (check) {
        return res.status(200).json({
            err: "You already Booked this tours!"
        })
    }

    const request = await bookingModel.create(req.body)
    if (!request) {
        return res.status(200).json({
            err: "Cant Books this tours!"
        })
    }

    return res.status(200).json({
        msg: "Success",
        err: null
    })
}