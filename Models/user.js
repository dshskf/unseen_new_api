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
    lat: {
        type: sequelize.DECIMAL,
        // allowNull: false
    },
    lng: {
        type: sequelize.DECIMAL,
        // allowNull: false
    },
    image: {
        type: sequelize.STRING,
        // allowNull: false
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
    repass_token: {
        type: sequelize.STRING,
    },
    repass_token_expired: {
        type: sequelize.DATE
    }

})

module.exports = user