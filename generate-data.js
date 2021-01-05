const express = require('express')
const router = express.Router()
const faker = require('faker');

const userModel = require('./Models/user')
const agencyModel = require('./Models/agency')
const guidesModel = require('./Models/guides')
const toursAgency = require('./Models/tours-agency')
const toursGuides = require('./Models/tours-guides')
const requestModel = require('./Models/request')
const commentModel = require('./Models/comment')
const boookingModel = require('./Models/booking')
const chatModel = require('./Models/chats')
const destinationModel = require('./Models/destination');

const fillUser = () => ({
    id: faker.random.number(),
    username: faker.name.findName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    phone: faker.phone.phoneNumber(),
    image: faker.image.imageUrl(),
})

const fillAgency = () => ({
    id: faker.random.number(),
    username: faker.name.findName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    phone: faker.phone.phoneNumber(),
    image: faker.image.imageUrl(),
    cost: faker.random.number()
})

const fillGuides = () => ({
    id: faker.random.number(),
    username: faker.name.findName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    phone: faker.phone.phoneNumber(),
    image: faker.image.city(),
    rating: Math.floor(Math.random() * 5) + 1,
    cost: Math.floor(Math.random() * 10000) + 10,
    country_id: Math.floor(Math.random() * 50) + 1,
    total_tours: Math.floor(Math.random() * 1000) + 10
})


const fillToursAgency = (id) => ({
    id: faker.random.number(),
    title: "Holiday-" + faker.random.words(),
    cost: faker.random.number(),
    rating: faker.random.number(),
    total_tours: faker.random.number(),
    description: faker.lorem.words(),
    start_date: faker.date.recent(),
    end_date: faker.date.recent(),
    isActive: faker.random.boolean(),
    image: [faker.image.city(), faker.image.city()],
    quota_left: faker.random.number(),
    quota: faker.random.number(),
    agencyId: id,
    rating: Math.floor(Math.random() * 5) + 1
})

const fillToursGuides = (id) => ({
    id: faker.random.number(),
    title: faker.random.words(),
    cost: faker.random.number(),
    rating: faker.random.number(),
    total_tours: faker.random.number(),
    description: faker.lorem.words(),
    start_date: faker.date.recent(),
    end_date: faker.date.recent(),
    isActive: faker.random.boolean(),
    image: [faker.image.imageUrl(), faker.image.imageUrl()],
    quota_left: faker.random.number(),
    quota: faker.random.number(),
    guideId: id,
    rating: Math.floor(Math.random() * 5) + 1
})

const fillDestination = (id, bools) => ({
    tours_id: id,
    isGuides: bools,
    country_id: faker.random.number(),
    state_id: faker.random.number(),
    city_id: faker.random.number(),
    number_of_days: faker.random.number(),
})


router.get('/', async (req, res, next) => {
    for (let i = 0; i < 20; i++) {
        user = fillUser()
        agency = fillAgency()
        guides = fillGuides()

        // await userModel.create(user)
        // await agencyModel.create(agency)
        await guidesModel.create(guides)

        // for (let j = 0; j < 3; j++) {
        //     t_agency = fillToursAgency(agency.id)
        //     t_guides = fillToursGuides(guides.id)

        //     await toursAgency.create(t_agency)
        //     await toursGuides.create(t_guides)

        //     for (let k = 0; k < 2; k++) {
        //         dest_agency = fillDestination(t_agency.id, false)
        //         dest_guides = fillDestination(t_guides.id, true)

        //         await destinationModel.create(dest_agency)
        //         await destinationModel.create(dest_guides)

        //         dest_agency = fillDestination(t_guides.id, false)
        //         dest_guides = fillDestination(t_agency.id, true)

        //         await destinationModel.create(dest_agency)
        //         await destinationModel.create(dest_guides)
        //     }
        // }

    }

    return res.status(200).json({
        status: "Filled!"
    })
})

const { guidesData } = require('./data')

router.get('/fill', async (req, res, next) => {
    return res.json({
        guide: guidesData
    })
})


module.exports = router