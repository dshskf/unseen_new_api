const sequelize = require('sequelize')

const connect = new sequelize(
    'unseen',
    'postgres',
    'root',
    {
        dialect: 'postgres',
        port:'9876',
        logging: false
    }
)

module.exports = connect