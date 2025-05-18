const express = require('express')
const {
  signUp,
  signIn,
  signJWTForUser
} = require('../middleware/auth')
const passport = require('passport')

const router = new express.Router()

// Sign up
router.post('/auth/sign-up', signUp, signJWTForUser)

// Sign in - using custom middleware to handle auth failures
router.post('/auth', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ error: { message: info.message || 'There was an error with your email or password. Please try again.' } });
    }
    req.user = user;
    next();
  })(req, res, next);
}, signJWTForUser)

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
