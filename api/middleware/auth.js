const passport = require('passport')
const JWT = require('jsonwebtoken')
const PassportJWT = require('passport-jwt')
const LocalStrategy = require('passport-local').Strategy
const User = require('../models/User')
const bcrypt = require('bcrypt')

const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret'
const jwtAlgorithm = process.env.JWT_ALGORITHM || 'HS256'
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d'

// Local strategy for username/password authentication
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ where: { email: email.toLowerCase() } })
      
      if (!user) {
        return done(null, false, { message: 'Incorrect email or password.' })
      }
      
      const validPassword = await bcrypt.compare(password, user.password)
      
      if (!validPassword) {
        return done(null, false, { message: 'Incorrect email or password.' })
      }
      
      return done(null, user)
    } catch (error) {
      return done(error)
    }
  }
))

const signUp = async (req, res, next) => {
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(400).send('No email or password provided.')
    }

    const existingUser = await User.findOne({ where: { email: req.body.email.toLowerCase() } })
    
    if (existingUser) {
      return res.status(400).send('A user with this email already exists.')
    }
    
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    
    const user = await User.create({
      email: req.body.email.toLowerCase(),
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: hashedPassword
    })
    
    req.user = user
    next()
  } catch (error) {
    next(error)
  }
}

const signJWTForUser = (req, res) => {
  const user = req.user
  const token = JWT.sign(
    {
      email: user.email
    },
    jwtSecret,
    {
      algorithm: jwtAlgorithm,
      expiresIn: jwtExpiresIn,
      subject: user.id.toString()
    }
  )
  res.json({ token })
}

passport.use(
  new PassportJWT.Strategy(
    {
      jwtFromRequest: PassportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
      algorithms: [jwtAlgorithm]
    },
    async (payload, done) => {
      try {
        const user = await User.findByPk(payload.sub)
        
        if (user) {
          done(null, user)
        } else {
          done(null, false)
        }
      } catch (error) {
        done(error, false)
      }
    }
  )
)

module.exports = {
  initialize: passport.initialize(),
  signUp,
  signIn: passport.authenticate('local', { session: false }),
  requireJWT: passport.authenticate('jwt', { session: false }),
  signJWTForUser
}
