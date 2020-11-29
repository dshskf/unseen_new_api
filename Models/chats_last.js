const sequelize = require('sequelize')
const db = require('../config/sequelize')

const chats = db.define('chats_last', {
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
    receiver_type: {
        type: sequelize.CHAR(1),
        allowNull: false
    },
    content: {
        type: sequelize.TEXT,
        allowNull: false
    },   
})

module.exports = chats