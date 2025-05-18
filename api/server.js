if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const authMiddleware = require('./middleware/auth')
const config = require('./config')

// Initialize Sequelize database connection
require('./models/init')

const server = express()

// Middleware
server.use(bodyParser.json())
server.use(cors({
  origin: 'http://localhost:3000', // Specify the exact origin of your frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Allow credentials (cookies, auth headers)
}))
server.use(authMiddleware.initialize)

// Routes
server.use([require('./routes/auth'), require('./routes/rooms')])

// Error handling
server.use((error, req, res, next) => {
  res.json({
    error: {
      message: error.message
    }
  })
})

// Read port and host from the configuration file
server.listen(config.port, config.host, error => {
  if (error) {
    console.error('Error starting', error)
  } else {
    console.info('Express listening on port ', config.port)
  }
})
