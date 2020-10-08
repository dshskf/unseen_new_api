const sequelize = require('sequelize')
const db = require('../config/sequelize')

const toursGuides = db.define('tours_guides_ads', {
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
    rating: {
        type: sequelize.INTEGER
    },
    total_tours: {
        type: sequelize.INTEGER,
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
    isActive: {
        type: sequelize.BOOLEAN,
    },
    image: {
        type: sequelize.ARRAY(sequelize.STRING),
        allowNull: false
    },
    quota_left: {
        type: sequelize.INTEGER
    },
    quota: {
        type: sequelize.INTEGER
    },    
})

module.exports = toursGuides