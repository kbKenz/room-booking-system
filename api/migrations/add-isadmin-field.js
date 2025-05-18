const { Sequelize } = require('sequelize');
const sequelize = require('../models/db');

async function migrate() {
  try {
    console.log('Starting migration: Adding isAdmin field to Users table');
    
    // First check if the column already exists
    const [results] = await sequelize.query(
      "PRAGMA table_info(Users);"
    );
    
    const columnExists = results.some(column => column.name === 'isAdmin');
    
    if (!columnExists) {
      // Add the isAdmin column with default value false
      await sequelize.query(
        'ALTER TABLE Users ADD COLUMN isAdmin BOOLEAN DEFAULT 0;'
      );
      console.log('Successfully added isAdmin column to Users table');
      
      // Set the first user as admin (usually the initial admin account)
      await sequelize.query(
        'UPDATE Users SET isAdmin = 1 WHERE id = 1;'
      );
      // Verify the update worked
      const [adminCheck] = await sequelize.query(
        'SELECT * FROM Users WHERE id = 1;'
      );
      if (adminCheck && adminCheck.length > 0) {
        console.log('Admin user details:', {
          id: adminCheck[0].id,
          email: adminCheck[0].email,
          isAdmin: adminCheck[0].isAdmin
        });
        if (!adminCheck[0].isAdmin) {
          console.warn('Warning: Admin flag was not set correctly on user #1');
          // Try once more with a different approach
          await sequelize.query(
            'UPDATE Users SET isAdmin = true WHERE id = 1;'
          );
          console.log('Attempted admin update again with boolean value');
        } else {
          console.log('Successfully set the first user as admin');
        }
      } else {
        console.warn('Warning: Could not find user with ID 1');
      }
    } else {
      console.log('The isAdmin column already exists in Users table');
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