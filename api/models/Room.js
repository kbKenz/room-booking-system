const { DataTypes } = require('sequelize')
const sequelize = require('./db')
const moment = require('moment')

const Room = sequelize.define('Room', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  floor: {
    type: DataTypes.STRING,
    allowNull: false
  },
  capacity: {
    type: DataTypes.INTEGER
  },
  assets: {
    type: DataTypes.JSON,
    defaultValue: {
      macLab: false,
      pcLab: false,
      projector: false,
      tv: false,
      opWalls: false,
      whiteBoard: false
    }
  }
}, {
  timestamps: true
})

const Booking = sequelize.define('Booking', {
  bookingStart: {
    type: DataTypes.DATE,
    allowNull: false
  },
  bookingEnd: {
    type: DataTypes.DATE,
    allowNull: false
  },
  startHour: {
    type: DataTypes.INTEGER
  },
  duration: {
    type: DataTypes.INTEGER
  },
  businessUnit: {
    type: DataTypes.STRING,
    allowNull: false
  },
  purpose: {
    type: DataTypes.STRING,
    allowNull: false
  },
  recurring: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (booking) => {
      await checkBookingConflicts(booking)
    },
    beforeUpdate: async (booking) => {
      await checkBookingConflicts(booking)
    }
  }
})

// Set up associations
Room.hasMany(Booking)
Booking.belongsTo(Room)

const User = require('./User')
Booking.belongsTo(User)

// Function to check booking conflicts
async function checkBookingConflicts(booking) {
  // Skip validation if no roomId is provided yet
  if (!booking.RoomId) return

  const newBookingStart = booking.bookingStart.getTime()
  const newBookingEnd = booking.bookingEnd.getTime()

  // Find existing bookings for the same room
  const existingBookings = await Booking.findAll({
    where: {
      RoomId: booking.RoomId,
      id: {
        [sequelize.Sequelize.Op.ne]: booking.id || 0 // Exclude current booking when updating
      }
    }
  })

  // Check for booking conflicts
  for (const existingBooking of existingBookings) {
    const existingStart = new Date(existingBooking.bookingStart).getTime()
    const existingEnd = new Date(existingBooking.bookingEnd).getTime()

    if ((newBookingStart >= existingStart && newBookingStart < existingEnd) || 
        (existingStart >= newBookingStart && existingStart < newBookingEnd)) {
      
      throw new Error(
        `Booking could not be saved. There is a clash with an existing booking from ${moment(existingStart).format('HH:mm')} to ${moment(existingEnd).format('HH:mm on LL')}`
      )
    }
  }
}

module.exports = { Room, Booking }
