const { Sequelize } = require('sequelize')
const path = require('path')

// Create SQLite database connection
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: false // set to console.log to see SQL queries
})

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate()
    console.log('Successfully connected to SQLite database')
  } catch (error) {
    console.error('Error connecting to SQLite database:', error)
  }
}

testConnection()

module.exports = sequelize 