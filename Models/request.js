const sequelize = require('sequelize')
const db = require('../config')

const request = db.define('request', {
    id: {
        type: sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    product_id: {
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
    isApprove: {
        type: sequelize.INTEGER,
        allowNull: false
    },
    isPaying: {
        type: sequelize.INTEGER,
        allowNull: false
    },
    isActive: {
        type: sequelize.INTEGER,
        allowNull: false
    }


})

module.exports = request