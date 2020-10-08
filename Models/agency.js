const sequelize = require('sequelize')
const db = require('../config/sequelize')
const { Sequelize } = require('sequelize')

const agency = db.define('agency', {
    id: {
        type: sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: sequelize.STRING,
        allowNull: false
    },
    email: {
        type: sequelize.STRING,
        allowNull: false
    },
    password: {
        type: sequelize.STRING,
        allowNull: false
    },
    phone: {
        type: sequelize.TEXT,
    },
    rating: {
        type: sequelize.DECIMAL
    },
    total_tours: {
        type: sequelize.INTEGER,
    },
    lat: {
        type: sequelize.DECIMAL,
    },
    lng: {
        type: sequelize.DECIMAL,
    },
    image: {
        type: sequelize.STRING,
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
    isActive: {
        type: sequelize.BOOLEAN
    },
    certificated: {
        type: sequelize.BOOLEAN
    },
    repass_token: {
        type: sequelize.STRING,
    },
    repass_token_expired: {
        type: sequelize.DATE
    }
})

module.exports = agency