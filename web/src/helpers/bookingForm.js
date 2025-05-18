import React from 'react'

// the <option> elements for the startTime and endTime <select> dropdowns
export const startTimeSelectOptions = [
  <option value="8:00">8:00am</option>,
  <option value="8:30">8:30am</option>,
  <option value="9:00">9:00am</option>,
  <option value="9:30">9:30am</option>,
  <option value="10:00">10:00am</option>,
  <option value="10:30">10:30am</option>,
  <option value="11:00">11:00am</option>,
  <option value="11:30">11:30am</option>,
  <option value="12:00">12:00pm</option>,
  <option value="12:30">12:30pm</option>,
  <option value="13:00">1:00pm</option>,
  <option value="13:30">1:30pm</option>,
  <option value="14:00">2:00pm</option>,
  <option value="14:30">2:30pm</option>,
  <option value="15:00">3:00pm</option>,
  <option value="15:30">3:30pm</option>,
  <option value="16:00">4:00pm</option>,
  <option value="16:30">4:30pm</option>,
  <option value="17:00">5:00pm</option>,
  <option value="17:30">5:30pm</option>,
  <option value="18:00">6:00pm</option>,
  <option value="18:30">6:30pm</option>,
  <option value="19:00">7:00pm</option>,
  <option value="19:30">7:30pm</option>,
  <option value="20:00">8:00pm</option>,
  <option value="20:30">8:30pm</option>
]

export const endTimeSelectOptions = [
  <option value="8:30">8:30am</option>,
  <option value="9:00">9:00am</option>,
  <option value="9:30">9:30am</option>,
  <option value="10:00">10:00am</option>,
  <option value="10:30">10:30am</option>,
  <option value="11:00">11:00am</option>,
  <option value="11:30">11:30am</option>,
  <option value="12:00">12:00pm</option>,
  <option value="12:30">12:30pm</option>,
  <option value="13:00">1:00pm</option>,
  <option value="13:30">1:30pm</option>,
  <option value="14:00">2:00pm</option>,
  <option value="14:30">2:30pm</option>,
  <option value="15:00">3:00pm</option>,
  <option value="15:30">3:30pm</option>,
  <option value="16:00">4:00pm</option>,
  <option value="16:30">4:30pm</option>,
  <option value="17:00">5:00pm</option>,
  <option value="17:30">5:30pm</option>,
  <option value="18:00">6:00pm</option>,
  <option value="18:30">6:30pm</option>,
  <option value="19:00">7:00pm</option>,
  <option value="19:30">7:30pm</option>,
  <option value="20:00">8:00pm</option>,
  <option value="20:30">8:30pm</option>,
  <option value="21:00">9:00pm</option>
]

// formats the time extracted from the time inputs into an array, eg 8:30 => [8, 30]
export const formatTime = (time) => {
  console.log('Formatting time:', time);
  
  if (!time) {
    console.error('Invalid time value:', time);
    return [0, 0];
  }
  
  try {
    // Split the time string and convert to integers
    let formatedTimeArray = time.split(':').map((item) => parseInt(item, 10));
    
    // Make sure we have valid numbers
    if (formatedTimeArray.length !== 2 || isNaN(formatedTimeArray[0]) || isNaN(formatedTimeArray[1])) {
      console.error('Invalid time format:', time, formatedTimeArray);
      return [0, 0];
    }
    
    console.log('Formatted time array:', formatedTimeArray);
    return formatedTimeArray;
  } catch (error) {
    console.error('Error formatting time:', error);
    return [0, 0];
  }
}

// Find the Room and floor number from the booking ID
export const findRoomInfo = (roomId, roomData) => {
  // Handle cases where roomData is missing or roomId is undefined
  if (!roomData || !Array.isArray(roomData) || roomId === undefined || roomId === null) {
    return { name: 'Room not found', floor: 'N/A' }
  }

  // Convert string ID to number if needed (API may return numeric IDs)
  const searchId = roomId.toString()
  
  // Find the room that matches the ID
  const roomInfo = roomData.find(room => 
    room._id === searchId || room._id === roomId || room.id === parseInt(roomId)
  )
  
  // Return default values if room not found
  return roomInfo || { name: 'Room not found', floor: 'N/A' }
}

