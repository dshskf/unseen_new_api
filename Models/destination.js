const sequelize = require('sequelize')
const db = require('../config/sequelize')

const destination = db.define('destination', {
    id: {
        type: sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    tours_id: {
        type: sequelize.INTEGER
    },
    isGuides: {
        type: sequelize.BOOLEAN
    },
    country_id: {
        type: sequelize.INTEGER
    },
    state_id: {
        type: sequelize.INTEGER
    },
    city_id: {
        type: sequelize.INTEGER
    },
    period: {
        type: sequelize.INTEGER,
    }
})

module.exports = destination