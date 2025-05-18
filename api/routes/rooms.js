const express = require('express')
const moment = require('moment')
const momentTimezone = require('moment-timezone')
const { Room, Booking } = require('../models/Room')
const { requireJWT } = require('../middleware/auth')

const router = new express.Router()

router.get('/rooms', requireJWT, async (req, res) => {
  try {
    const rooms = await Room.findAll({
      include: [{
        model: Booking,
        as: 'Bookings'
      }]
    })
    res.json(rooms)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/rooms', requireJWT, async (req, res) => {
  try {
    const room = await Room.create(req.body)
    res.status(201).json(room)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Function to convert UTC JS Date object to a Moment.js object in AEST
const dateAEST = date => {
  return momentTimezone(date).tz('Australia/Sydney')
}

// Function to calculate the duration of the hours between the start and end of the booking
const durationHours = (bookingStart, bookingEnd) => {
  // convert the UTC Date objects to Moment.js objeccts
  let startDateLocal = dateAEST(bookingStart)
  let endDateLocal = dateAEST(bookingEnd)
  // calculate the duration of the difference between the two times
  let difference = moment.duration(endDateLocal.diff(startDateLocal))
  // return the difference in decimal format
  return difference.hours() + difference.minutes() / 60
}

// Make a booking
router.put('/rooms/:id', requireJWT, async (req, res) => {
  try {
    const { id } = req.params
    const room = await Room.findByPk(id)
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' })
    }

    // If the recurring array is empty, the booking is not recurring
    if (req.body.recurring.length === 0) {
      const booking = await Booking.create({
        UserId: req.user.id,
        RoomId: id,
        // The hour on which the booking starts, calculated from 12:00AM as time = 0
        startHour: dateAEST(req.body.bookingStart).format('H.mm'),
        // The duration of the booking in decimal format
        duration: durationHours(req.body.bookingStart, req.body.bookingEnd),
        // Spread operator for remaining attributes
        ...req.body
      })
      
      // Reload room with updated bookings
      const updatedRoom = await Room.findByPk(id, {
        include: [{
          model: Booking,
          as: 'Bookings'
        }]
      })
      
      res.status(201).json(updatedRoom)
    } else {
      // If the booking is a recurring booking
      
      // The first booking in the recurring booking range
      let firstBooking = {
        UserId: req.user.id,
        RoomId: id,
        startHour: dateAEST(req.body.bookingStart).format('H.mm'),
        duration: durationHours(req.body.bookingStart, req.body.bookingEnd),
        ...req.body
      }
      
      // An array containing the first booking, to which all additional bookings in the recurring range will be added
      let recurringBookings = [ firstBooking ]
      
      // A Moment.js object to track each date in the recurring range, initialised with the first date
      let bookingDateTracker = momentTimezone(firstBooking.bookingStart).tz('Australia/Sydney')
      
      // A Moment.js date object for the final booking date in the recurring booking range - set to one hour ahead of the first booking
      let lastBookingDate = momentTimezone(firstBooking.recurring[0]).tz('Australia/Sydney')
      lastBookingDate.hour(bookingDateTracker.hour() + 1)
      
      // The number of subsequent bookings in the recurring booking date range 
      let bookingsInRange = req.body.recurring[1] === 'daily' ? 
                            Math.floor(lastBookingDate.diff(bookingDateTracker, 'days', true)) :
                            req.body.recurring[1] === 'weekly' ?
                            Math.floor(lastBookingDate.diff(bookingDateTracker, 'weeks', true)) :
                            Math.floor(lastBookingDate.diff(bookingDateTracker, 'months', true))

      // Set the units which will be added to the bookingDateTracker - days, weeks or months
      let units = req.body.recurring[1] === 'daily' ? 'd' : 
                  req.body.recurring[1] === 'weekly' ? 'w' : 'M'
      
      // Each loop will represent a potential booking in this range 
      for (let i = 0; i < bookingsInRange; i++) {
        
        // Add one unit to the booking tracker to get the date of the potential booking
        let proposedBookingDateStart = bookingDateTracker.add(1, units)
      
        // Check whether this day is a Sunday (no bookings on Sundays)
        if (proposedBookingDateStart.day() !== 0) {
          
          // Create a new booking object based on the first booking 
          let newBooking = Object.assign({}, firstBooking)
          
          // Calculate the end date/time of the new booking by adding the number of units to the first booking's end date/time
          let firstBookingEndDate = momentTimezone(firstBooking.bookingEnd).tz('Australia/Sydney')
          let proposedBookingDateEnd = firstBookingEndDate.add(i + 1, units)
          
          // Update the new booking object's start and end dates
          newBooking.bookingStart = proposedBookingDateStart.toDate()
          newBooking.bookingEnd = proposedBookingDateEnd.toDate()
          
          // Add the new booking to the recurring booking array
          recurringBookings.push(newBooking)
        }
      }
      
      // Create all bookings
      await Booking.bulkCreate(recurringBookings)
      
      // Reload room with updated bookings
      const updatedRoom = await Room.findByPk(id, {
        include: [{
          model: Booking,
          as: 'Bookings'
        }]
      })
      
      res.status(201).json(updatedRoom)
    }
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete a booking
router.delete('/rooms/:id/:bookingId', requireJWT, async (req, res) => {
  try {
    const { id, bookingId } = req.params
    
    console.log('==== DELETE BOOKING REQUEST ====');
    console.log('- Room ID:', id);
    console.log('- Booking ID:', bookingId);
    console.log('- Current User:', {
      id: req.user.id,
      email: req.user.email,
      isAdmin: !!req.user.isAdmin
    });
    
    // Find the booking to check permissions
    const booking = await Booking.findOne({
      where: {
        id: bookingId,
        RoomId: id
      }
    })
    
    if (!booking) {
      console.log('Booking not found');
      return res.status(404).json({ error: 'Booking not found' })
    }
    
    console.log('Booking found:', JSON.stringify(booking, null, 2));
    
    // Check all possible user ID fields in the booking
    const bookingUserId = booking.UserId || booking.userId || booking.user;
    const requestUserId = req.user.id;
    
    console.log('Permission check:');
    console.log('- User isAdmin:', !!req.user.isAdmin);
    console.log('- Request User ID:', requestUserId, typeof requestUserId);
    console.log('- Booking User ID:', bookingUserId, typeof bookingUserId);
    console.log('- String comparison:', String(bookingUserId) === String(requestUserId));
    
    // Get booking user email if available for additional check
    const bookingUserEmail = booking.userEmail || booking.user_email;
    const currentUserEmail = req.user.email;
    console.log('Email check:');
    console.log('- Request User Email:', currentUserEmail);
    console.log('- Booking User Email:', bookingUserEmail);
    
    // Check if user is authorized to delete this booking
    // Allow if: user is admin OR user created the booking (check by ID or email)
    if (!req.user.isAdmin && 
        String(bookingUserId) !== String(requestUserId) && 
        bookingUserEmail !== currentUserEmail) {
      
      console.log('Permission DENIED - User is not admin and not the booking creator');
      return res.status(403).json({ 
        error: 'Unauthorized: Only admins or the booking creator can delete bookings' 
      })
    }
    
    console.log('Permission GRANTED - Proceeding with deletion');
    
    // Delete the booking
    await Booking.destroy({
      where: {
        id: bookingId,
        RoomId: id
      }
    })
    
    // Reload room with updated bookings
    const updatedRoom = await Room.findByPk(id, {
      include: [{
        model: Booking,
        as: 'Bookings'
      }]
    })
    
    res.status(201).json(updatedRoom)
  } catch (error) {
    console.error('Error in delete booking route:', error);
    res.status(400).json({ error: error.message })
  }
})

module.exports = router
