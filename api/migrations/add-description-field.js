const { Sequelize } = require('sequelize');
const sequelize = require('../models/db');

async function migrate() {
  try {
    console.log('Starting migration: Adding description field to Bookings table');
    
    // SQLite approach - try to add the column directly
    try {
      await sequelize.query(
        'ALTER TABLE Bookings ADD COLUMN description TEXT;'
      );
      console.log('Successfully added description column to Bookings table');
    } catch (error) {
      // If the column already exists, SQLite will throw an error
      if (error.message.includes('duplicate column name')) {
        console.log('The description column already exists in Bookings table');
      } else {
        // Re-throw if it's a different error
        throw error;
      }
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    console.log('Closing database connection');
    await sequelize.close();
  }
}

// Run the migration
migrate(); 