const sequelize = require('sequelize')
const db = require('../config')

const chats = db.define('chat', {
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
    receiver_id: {
        type: sequelize.INTEGER,
        allowNull: false
    },
    content: {
        type: sequelize.TEXT,
        allowNull: false
    },    
    ads_id: {
        type: sequelize.INTEGER
    }

})

module.exports = chats