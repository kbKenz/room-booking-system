const express = require('express')
const {
  signUp,
  signIn,
  signJWTForUser
} = require('../middleware/auth')

const router = new express.Router()

// Sign up
router.post('/auth/sign-up', signUp, signJWTForUser)

// Sign in
router.post('/auth', signIn, signJWTForUser)

// Add better error handling
router.use((err, req, res, next) => {
  if (err.name === 'UserExistsError') {
    // Handle duplicate email error
    return res.status(409).json({
      error: {
        message: 'A user with this email already exists'
      }
    })
  }
  
  // Handle other authentication errors
  return res.status(500).json({
    error: {
      message: err.message || 'An unexpected error occurred'
    }
  })
})

module.exports = router
