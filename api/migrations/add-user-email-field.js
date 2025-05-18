const { Sequelize } = require('sequelize');
const sequelize = require('../models/db');
const { User } = require('../models/User');

async function migrate() {
  try {
    console.log('Starting migration: Adding userEmail field to Bookings table');
    
    // Step 1: Add the userEmail column
    try {
      await sequelize.query(
        'ALTER TABLE Bookings ADD COLUMN userEmail TEXT;'
      );
      console.log('Successfully added userEmail column to Bookings table');
    } catch (error) {
      // If the column already exists, SQLite will throw an error
      if (error.message.includes('duplicate column name')) {
        console.log('The userEmail column already exists in Bookings table');
      } else {
        // Re-throw if it's a different error
        throw error;
      }
    }
    
    // Step 2: Update existing records to set userEmail based on UserId
    console.log('Updating existing bookings with user email...');
    
    // Get all bookings with their User IDs
    const bookings = await sequelize.query(
      'SELECT id, UserId FROM Bookings WHERE userEmail IS NULL AND UserId IS NOT NULL',
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    console.log(`Found ${bookings.length} bookings that need email updates`);
    
    // For each booking, find the user's email and update the booking
    for (const booking of bookings) {
      if (booking.UserId) {
        // Get the user's email from the Users table
        const [user] = await sequelize.query(
          'SELECT email FROM Users WHERE id = ?',
          { 
            replacements: [booking.UserId],
            type: Sequelize.QueryTypes.SELECT 
          }
        );
        
        if (user && user.email) {
          // Update the booking with the user's email
          await sequelize.query(
            'UPDATE Bookings SET userEmail = ? WHERE id = ?',
            { 
              replacements: [user.email, booking.id],
              type: Sequelize.QueryTypes.UPDATE 
            }
          );
          console.log(`Updated booking ${booking.id} with email from user ${booking.UserId}`);
        } else {
          console.log(`Warning: No email found for user ID ${booking.UserId}`);
        }
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