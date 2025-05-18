const sequelize = require('./db')
const { Room, Booking } = require('./Room')
const User = require('./User')

// Define any additional model relationships here if needed

// Sync all models with the database
const initDb = async () => {
  try {
    await sequelize.sync()
    console.log('Database tables synchronized successfully')
  } catch (error) {
    console.error('Error synchronizing database tables:', error)
  }
}

// Run database initialization
initDb()

module.exports = sequelize
