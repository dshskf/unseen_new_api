const sequelize = require('sequelize')

const connect = new sequelize(
    'unseen',
    'postgres',
    'root',
    {
        dialect: 'postgres',
        logging: false
    }
)

module.exports = connect