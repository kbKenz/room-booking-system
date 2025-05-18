const { DataTypes } = require('sequelize')
const sequelize = require('./db')
const bcrypt = require('bcrypt')

const User = sequelize.define('User', {
  firstName: {
    type: DataTypes.STRING
  },
  lastName: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true
})

// Instance method to validate password
User.prototype.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password)
}

// Hook to hash password before saving
User.beforeCreate(async (user) => {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 10)
  }
})

module.exports = User
