const sequelize = require('sequelize')
const db = require('../config')

const product = db.define('products', {
    id: {
        type: sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: sequelize.STRING,
        allowNull: false
    },
    cost: {
        type: sequelize.DOUBLE,
        allowNull: false
    },
    destination: {
        type: sequelize.STRING,
        allowNull: false
    },
    rating: {
        type: sequelize.ARRAY(sequelize.INTEGER)
    },
    description: {
        type: sequelize.TEXT,
        allowNull: false
    },
    start_date: {
        type: sequelize.DATE,
        allowNull: false
    },
    end_date: {
        type: sequelize.DATE,
        allowNull: false
    },
    status: {
        type: sequelize.STRING,
        allowNull: false
    },
    // type: {
    //     type: sequelize.STRING
    // },
    image: {
        type: sequelize.ARRAY(sequelize.STRING),
        allowNull: false
    }

})

module.exports = product