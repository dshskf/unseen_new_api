const sequelize = require('sequelize')
const db = require('../config/sequelize')

const bookings = db.define('bookings', {
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
    is_payed: {
        type: sequelize.BOOLEAN
    },
    is_active: {
        type: sequelize.BOOLEAN
    },
    receiver_type: {
        type: sequelize.CHAR(1),
        allowNull: false
    }
})

module.exports = bookings