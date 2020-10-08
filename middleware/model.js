const userModel = require('../Models/user')
const guidesModel = require('../Models/guides')
const agencyModel = require('../Models/agency')

const toursGuidesModel = require('../Models/tours-guides')
const toursAgencyModel = require('../Models/tours-agency')


module.exports = (req, res, next) => {
    if (req.body.type === 'user') {
        req.userModel = userModel
    } else if (req.body.type === 'agency') {
        req.userModel = agencyModel
        req.toursModel = toursAgencyModel
        req.isGuides = false
    } else if (req.body.type === 'guides') {
        req.userModel = guidesModel
        req.toursModel = toursGuidesModel
        req.isGuides = true
    } else {
        return res.status(200).json({
            err: 'Missing type parameter!'
        })
    }

    next()
}