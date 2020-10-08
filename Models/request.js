const sequelize = require('sequelize')
const db = require('../config/sequelize')

const request = db.define('request', {
    id: {
        type: sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    tours_id: {
        type: sequelize.INTEGER,
        allowNull: false
    },
    sender_id: {
        type: sequelize.INTEGER,
        allowNull: false
    },
    receiver_id: {
        type: sequelize.INTEGER,
        allowNull: false
    },
    reason: {
        type: sequelize.TEXT,
        allowNull: false
    },
    offers_price: {
        type: sequelize.FLOAT,
        allowNull: false
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
    start_date: {
        type: sequelize.DATE,
        allowNull: false
    },
    end_date: {
        type: sequelize.DATE,
        allowNull: false
    },
    is_approve: {
        type: sequelize.INTEGER,
        allowNull: false
    },
    is_paying: {
        type: sequelize.INTEGER,
        allowNull: false
    },
    is_active: {
        type: sequelize.INTEGER,
        allowNull: false
    },
    receiver_type: {
        type: sequelize.CHAR(1),
        allowNull: false
    },
    sender_type: {
        type: sequelize.CHAR(1),
        allowNull: false
    }
})

module.exports = request