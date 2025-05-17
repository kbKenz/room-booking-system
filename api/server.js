if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const authMiddleware = require('./middleware/auth')

const config = require('./config')

const server = express()

// Middleware
server.use(bodyParser.json())
server.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.REACT_APP_FRONTEND_URL || 'https://your-frontend-domain.com' 
    : 'http://localhost:3000',
  credentials: true
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
