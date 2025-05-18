const sequelize = require('./db')

const dropDatabase = async () => {
  try {
    // This will drop all tables defined through Sequelize
    await sequelize.drop()
    console.log('All tables have been dropped!')
    process.exit()
  } catch (error) {
    console.error('Error dropping tables:', error)
    process.exit(1)
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  dropDatabase()
}

module.exports = dropDatabase