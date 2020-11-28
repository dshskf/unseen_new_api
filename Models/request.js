const sequelize = require('sequelize')
const db = require('../config/sequelize')

const request = db.define('request', {
    id: {
        type: sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },   
    sender_id: {
        type: sequelize.INTEGER,
        allowNull: false
    },
    sender_type: {
        type: sequelize.CHAR(1),
        allowNull: false
    },
    receiver_id: {
        type: sequelize.INTEGER,
        allowNull: false
    },   
    description: {
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
        type: sequelize.BOOLEAN,
        allowNull: false
    },
    is_payed: {
        type: sequelize.BOOLEAN,
        allowNull: false
    },
    is_active: {
        type: sequelize.BOOLEAN,
        allowNull: false
    },
})

module.exports = request