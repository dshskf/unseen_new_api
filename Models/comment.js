const sequelize = require('sequelize')
const db = require('../config')

const comment = db.define('comments', {
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
    product_id: {
        type: sequelize.INTEGER,
        allowNull: false
    },
    comment: {
        type: sequelize.TEXT,
        allowNull: false
    },
    rating: {
        type: sequelize.DECIMAL,
        allowNull: false
    }

})

module.exports = comment