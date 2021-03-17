const toursAgencyModel = require('../Models/tours-agency')
const toursGuidesModel = require('../Models/tours-guides')
const bookingModel = require('../Models/booking')
const requestModel = require('../Models/request')
const agencyModel = require('../Models/agency')
const guidesModel = require('../Models/guides')
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
        limit = req.body.page * 15
    } else {
        offset = (req.body.page - 1) * 15
        limit = 15
    }

    const filter_query = req.body.input && req.body.input !== '' ?
        ` and lower(g.username) like '%${req.body.input.toLowerCase()}%'`
        :
        ''

    let guides = await sequelize.query(`
        SELECT g.id,g.username,g.cost,g.rating,g.total_tours,g.image,c.name as country
        FROM guides g 
        LEFT JOIN countries c on g.country_id=c.id
        where g.country_id is not null and g.image is not null ${filter_query}
        Limit ${limit} offset ${offset}     
    `)


    let total_page = await sequelize.query(`select count(*) from guides ${req.body.input && req.body.input !== '' ? `where lower(username) like '%${req.body.input.toLowerCase()}%'` : ''
        }`)
    let top_guides = await sequelize.query(`
        select username,total_tours from guides 
        where total_tours is not null and country_id is not null
        order by total_tours desc
        limit 5
    `)

    if (total_page[0][0].count % 15 === 0) {
        total_page = Math.floor(total_page[0][0].count / 15)
    } else {
        total_page = Math.ceil(total_page[0][0].count / 15)
    }

    guides = guides[0]

    return res.status(200).json({
        guides: guides,
        top_guide: top_guides[0],
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

    const filter_query = req.body.input && req.body.input !== '' ?
        ` where lower(title) like '%${req.body.input.toLowerCase()}%'`
        :
        ''

    let tours = await sequelize.query(`
        select d.tours_id as id, string_agg(''||c.name||'',',') as city, tours.title,tours.cost, tours.start_date,tours.end_date, tours.rating,tours.image, tours.agencyId,tours.username
        from destinations d
        inner join cities c on d.city_id=c.id
        inner join(
            SELECT t.id,t.title,t.cost, t.start_date,t.end_date, t.rating,t.image, a.id as agencyId,a.username
            FROM tours_agency_ads t
            INNER JOIN agency a on t."agencyId"=a.id
            ${filter_query}
        ) tours on tours.id=d.tours_id
        where tours.start_date>now() and tours.end_date>now()
        group by d.tours_id, tours.title,tours.cost, tours.start_date, tours.rating,tours.image, tours.agencyId,tours.username,tours.end_date
        order by d.tours_id
        limit ${limit} offset ${offset}  
    `)

    let top_agency = await sequelize.query(`
        select username,total_tours from agency
        where total_tours is not null and country_id is not null
        order by total_tours desc
        limit 5
    `)

    tours = tours[0]

    if (tours.length <= 0) {
        return res.status(200).json({
            err: `No result!`
        })
    }

    let total_page = await sequelize.query(`select count(*) from tours_agency_ads ${filter_query}`)

    if (total_page[0][0].count % 12 === 0) {
        total_page = Math.floor(total_page[0][0].count / 12)
    } else {
        total_page = Math.ceil(total_page[0][0].count / 12)
    }


    return res.status(200).json({
        tours: tours,
        total_page: total_page,
        top_agency: top_agency[0],
        err: null
    })
}

exports.get_tours_guides_detail = async (req, res, next) => {
    let guides = await sequelize.query(`
        SELECT g.*, c.iso3 as country, c2.name as city
        FROM guides g        
        left join countries c on c.id=g.country_id
        left join cities c2 on c2.id=g.city_id           
        where g.id=${req.body.id};
   `)
    guides = guides[0][0]
    guides.password = null

    return res.status(200).json({
        guides: guides,
        err: null
    })
}

exports.get_tours_agency_detail = async (req, res, next) => {
    const tours = await sequelize.query(`
        SELECT t.*, a.username, a.image as agency_images, c.name as city_name, d.period
        FROM tours_agency_ads t
        inner JOIN agency a on a.id=t."agencyId"
        inner join destinations d on d.tours_id=t.id
        inner join cities c on c.id=d.city_id
        where t.id=${req.body.id};
    `)

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
    const check = await requestModel.findOne({
        where: {
            sender_id: req.body.sender_id,
            receiver_id: req.body.receiver_id,
            sender_type: req.body.sender_type,
            is_reviewed: false
        }
    })

    if (check) {
        return res.status(200).json({
            err: "You already request this guides!"
        })
    }

    req.body.is_approve = false
    req.body.is_payed = false
    req.body.is_active = false
    req.body.is_reviewed = false
    req.body.start_date = new Date(req.body.start_date)
    req.body.end_date = new Date(req.body.end_date)

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
            tours_id: req.body.tours_id
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

exports.get_booking_list = async (req, res, next) => {
    let bookingList = await sequelize.query(`
        select b.id, tga.id as tours_id, tga.title as tours_title, tga.start_date, tga.end_date,
        u.id as user_id, u.username
        from bookings b
        inner join tours_agency_ads tga on b.tours_id=tga.id
        inner join users u on u.id = b.sender_id
        where b.receiver_id= ${req.userId} and b.guides_id is null and b.is_active = false and b.is_payed = true
    `)

    if (!bookingList || bookingList[0].length === 0) {
        return res.status(200).json({
            err: `No booking available!`
        })
    }
    bookingList = bookingList[0]

    return res.status(200).json({
        msg: "Success",
        data: bookingList,
        err: null
    })
}

exports.post_agency_request = async (req, res, next) => {
    let request = await requestModel.findOne({
        where: {
            sender_id: req.body.sender_id,
            sender_type: req.body.sender_type,
            receiver_id: req.body.receiver_id
        }
    })


    if (request) {
        return res.status(200).json({
            err: `You already request for this!`
        })
    }

    let update = await sequelize.query(`
        with update_bookings as(
            update bookings set guides_id=${req.body.receiver_id}
            where id=${req.body.booking_id} returning id
        )
        INSERT INTO requests(sender_id, sender_type, receiver_id, description, offers_price, 
            bookings_id, start_date, end_date, is_approve, is_payed, is_active,is_reviewed, "createdAt", "updatedAt")
        values(${req.body.sender_id},'${req.body.sender_type}',${req.body.receiver_id},'${req.body.description}', ${req.body.offers_price},
        ${req.body.booking_id},'${req.body.start_date}', '${req.body.end_date}', false,false,false,false,now(),now()) returning id
    `)

    if (!update) {
        return res.status(200).json({
            err: `Can't Update!`
        })
    }

    return res.status(200).json({
        msg: "Success",
        err: null
    })
}

exports.send_comments_booking = async (req, res, next) => {
    let agency = await agencyModel.findOne({
        where: {
            id: req.body.agency_id,
        }
    })

    if (!agency) {
        return res.status(200).json({
            err: `Agency was missing!`
        })
    }

    agency = agency.dataValues
    const total_tours = agency.total_tours === null ? 1 : parseInt(agency.total_tours.toString()) + 1
    const rating = agency.rating === null ? parseFloat(req.body.rating) : (parseFloat(agency.rating) + parseFloat(req.body.rating)) / parseFloat(total_tours)

    const post = await sequelize.query(`
        with insert_comment as (
            insert into comments(sender_id,tours_id,comment,rating,"createdAt","updatedAt")
            values(${req.body.sender_id},${req.body.tours_id},'${req.body.description}',${req.body.rating},now(),now())
            returning id
        ),
        update_bookings as (
            update bookings set is_reviewed=true where id=${req.body.booking_id} returning id
        )

        update agency set rating=${rating}, total_tours=${total_tours}
        where id = ${req.body.agency_id}
        returning id;
    `)

    if (!post) {
        return res.status(200).json({
            err: `Can't Send Comments!`
        })
    }

    return res.status(200).json({
        msg: "Success",
        err: null
    })
}


exports.send_comments_requests = async (req, res, next) => {
    let guides = await guidesModel.findOne({
        where: {
            id: req.body.guides_id,
        }
    })

    if (!guides) {
        return res.status(200).json({
            err: `guides was missing!`
        })
    }

    guides = guides.dataValues
    const total_tours = guides.total_tours === null ? 1 : parseInt(guides.total_tours.toString()) + 1
    const rating = guides.rating === null ? parseFloat(req.body.rating) : (parseFloat(guides.rating) + parseFloat(req.body.rating)) / parseFloat(total_tours)

    const post = await sequelize.query(`
        with insert_comment as(
            insert into comments(sender_id,guides_id,comment,rating,"createdAt","updatedAt")
            values(${req.body.sender_id},${req.body.guides_id},'${req.body.description}',${req.body.rating},now(),now())
            returning id            
        ), 
        update_req as (
            update requests set is_reviewed=true where id=${req.body.request_id} returning id
        )

        update guides set rating=${rating}, total_tours=${total_tours}
        where id = ${req.body.guides_id}
        returning id;       
    `)

    if (!post) {
        return res.status(200).json({
            err: `Can't Send Comments!`
        })
    }

    return res.status(200).json({
        msg: "Success",
        err: null
    })
}