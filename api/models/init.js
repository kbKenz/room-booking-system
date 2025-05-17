const mongoose = require('mongoose')

mongoose.Promise = global.Promise

// Connect with useMongoClient for Mongoose 4.x compatibility
mongoose.connect(process.env.MONGO_URI, { useMongoClient: true })
  .then(() => {
    console.log('Successfully connected to database')
  })
  .catch(error => {
    console.error('Error connecting to MongoDB database', error)
  })

module.exports = mongoose
