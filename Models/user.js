const sequelize = require('sequelize')
const db = require('../config')

const user = db.define('users', {
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
    phone: {
        type: sequelize.TEXT,
        allowNull: false
    },
    password: {
        type: sequelize.STRING,
        allowNull: false
    },
    account_types: {
        type: sequelize.STRING,
        allowNull: false
    },
    location: {
        type: sequelize.STRING,
        // allowNull: false
    },
    image: {
        type: sequelize.BLOB,
        // allowNull: false
    },
    repass_token: {
        type: sequelize.STRING,
    },
    repass_token_expired: {
        type: sequelize.DATE
    }

})

module.exports = user