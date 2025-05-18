import moment from 'moment'
import momentTimezone from 'moment-timezone'
import api from './init'
import { transformRoomData } from '../utils/dataAdapter'

// Function to receive booking data (AEST) and convert to JS Date object
// Data expected in [year, month, date, hours, seconds] format
const dateUTC = (dataArray) => {
  // Don't apply the timezone twice - the data is already in Sydney time
  // Just create a date object directly from the array
  console.log('Creating date from array:', dataArray);
  
  // Create the date string in ISO format (YYYY-MM-DDTHH:MM:00)
  const [year, month, day, hour, minute] = dataArray;
  const dateStr = `${year}-${String(month+1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
  
  console.log('ISO date string:', dateStr);
  
  // Create a moment in Sydney timezone
  const sydneyTime = momentTimezone.tz(dateStr, 'Australia/Sydney');
  console.log('Sydney time:', sydneyTime.format());
  
  // Convert to UTC time
  return sydneyTime.toDate();
}

// Make a room booking
export function makeBooking(data, existingBookings) {
  // Convert booking data to UTC Date objects
  let bookingStart = dateUTC(data.startDate)
  let bookingEnd = dateUTC(data.endDate)

  // Log the original and converted times for debugging
  console.log('Original startDate array:', data.startDate)
  console.log('Original endDate array:', data.endDate)
  console.log('Converted bookingStart:', bookingStart)
  console.log('Converted bookingEnd:', bookingEnd)
  
  // Also log in readable format
  console.log('Booking time (Sydney):', 
    momentTimezone.tz(bookingStart, 'Australia/Sydney').format('YYYY-MM-DD HH:mm'),
    'to',
    momentTimezone.tz(bookingEnd, 'Australia/Sydney').format('YYYY-MM-DD HH:mm')
  )

  // Convert booking Date objects into a number value
  let newBookingStart = bookingStart.getTime()
  let newBookingEnd = bookingEnd.getTime()

  // Check whether the new booking times overlap with any of the existing bookings
  let bookingClash = false

  existingBookings.forEach(booking => {

    // Convert existing booking Date objects into number values
    let existingBookingStart = new Date(booking.bookingStart).getTime()
    let existingBookingEnd = new Date(booking.bookingEnd).getTime()

    // Check whether there is a clash between the new booking and the existing booking
    if (newBookingStart >= existingBookingStart && newBookingStart < existingBookingEnd || 
        existingBookingStart >= newBookingStart && existingBookingStart < newBookingEnd) {
          // Switch the bookingClash variable if there is a clash
          return bookingClash = true
    }
  })

  // Ensure the new booking is valid (i.e. the start time is before the end time, and the booking is for a future time)
  let validDate = newBookingStart < newBookingEnd && newBookingStart > new Date().getTime()

  // If a recurring booking as been selected, ensure the end date is after the start date
  let validRecurring = (data.recurringData.length > 0) ? 
    dateUTC(data.recurringData[0]).getTime() > newBookingEnd : true

  // Save the booking to the database and return the booking if there are no clashes and the new booking time is not in the past
  if (!bookingClash && validDate && validRecurring) {
    console.log('Sending booking data:', data); // Log the data for debugging
    
    return api.put(`/rooms/${data.roomId}`, {
      bookingStart: bookingStart,
      bookingEnd: bookingEnd,
      businessUnit: data.businessUnit,
      purpose: data.purpose,
      description: data.description,
      userEmail: data.user, // Store the user's email
      roomId: data.roomId,
      recurring: data.recurringData
    })
      .then(res => res.data)
      .catch(err => alert(err.response.data.error.message.match(/error:.+/i)[0]))
  }
}

// Delete a room booking
export function deleteBooking(roomId, bookingId) {
  // Ensure IDs are in string format for the API call
  const safeRoomId = roomId.toString()
  const safeBookingId = bookingId.toString()
  
  console.log(`API delete booking call: room=${safeRoomId}, booking=${safeBookingId}`)
  
  // Add detailed data validation
  if (!safeRoomId || safeRoomId === 'undefined' || safeRoomId === 'null') {
    console.error('Invalid roomId:', roomId);
    return Promise.reject(new Error('Invalid room ID'));
  }
  
  if (!safeBookingId || safeBookingId === 'undefined' || safeBookingId === 'null') {
    console.error('Invalid bookingId:', bookingId);
    return Promise.reject(new Error('Invalid booking ID'));
  }
  
  return api.delete(`/rooms/${safeRoomId}/${safeBookingId}`)
    .then(res => {
      console.log('API delete booking response:', res.data)
      return res.data
    })
    .catch(err => {
      console.error('API delete booking error:', err);
      // Provide more detailed error information
      if (err.response) {
        console.error('Error response:', err.response.data);
        throw new Error(`Server error: ${err.response.status} - ${err.response.data.error || 'Unknown error'}`);
      } else if (err.request) {
        throw new Error('Network error: No response received from server');
      } else {
        throw new Error(`Request error: ${err.message}`);
      }
    })
}

export function updateStateRoom(self, updatedRoom, loadMyBookings) {
  // Transform the updatedRoom to ensure it has the right format
  const transformedRoom = transformRoomData([updatedRoom])[0];
  
  self.setState((previousState) => {
    // Find the relevant room in React State and replace it with the new room data
    const updatedRoomData = previousState.roomData.map((room) => {
      if (room._id === transformedRoom._id) {
        return transformedRoom
      } else {
        return room
      }
    })
    return {
      // Update the room data in application state
      roomData: updatedRoomData,
      currentRoom: transformedRoom
    }
  }, () => {
    // Call loadMyBookings as a callback after state is updated
    loadMyBookings()
  })
}