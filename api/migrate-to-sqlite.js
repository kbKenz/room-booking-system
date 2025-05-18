/**
 * This script helps migrate from MongoDB to SQLite
 * It sets up the SQLite database schema
 */

const sequelize = require('./models/db')
const { Room, Booking } = require('./models/Room')
const User = require('./models/User')
const bcrypt = require('bcrypt')

// Function to initialize the SQLite database
async function initDatabase() {
  try {
    // Sync database (create tables)
    await sequelize.sync({ force: true })
    console.log('Database tables created successfully')
    
    // Create a test admin user
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: await bcrypt.hash('password', 10)
    })
    
    console.log('Created admin user:', adminUser.email)
    console.log('Migration complete!')
    console.log('You can now run the seed script to populate rooms')
    
    process.exit(0)
  } catch (error) {
    console.error('Error during migration:', error)
    process.exit(1)
  }
}

initDatabase() 