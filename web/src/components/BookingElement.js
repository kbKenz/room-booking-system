import React from 'react'
import moment from 'moment'
import momentTimezone from 'moment-timezone'
import Button from './Button'
import { findRoomInfo } from '../helpers/bookingForm.js'

function BookingElement({
  bookingData,
  onDeleteBooking,
  roomData
}) {
  // Log booking data to debug IDs
  console.log('BookingElement - bookingData:', bookingData);
  
  // Handle both possible field names for IDs
  const roomId = bookingData.roomId || bookingData.RoomId;
  const bookingId = bookingData.id || bookingData._id || bookingData.id;
  
  console.log(`Delete would use roomId=${roomId}, bookingId=${bookingId}`);

  const roomInfo = findRoomInfo(roomId, roomData)
  const startTime = momentTimezone.tz(bookingData.bookingStart, 'Australia/Sydney').format('h.mma')
  const endTime = momentTimezone.tz(bookingData.bookingEnd, 'Australia/Sydney').format('h.mma')

  // Handle the delete action with proper ID checking
  const handleDelete = () => {
    if (!roomId) {
      console.error('Missing roomId in booking data:', bookingData);
      alert('Cannot delete: Missing room ID');
      return;
    }
    if (!bookingId) {
      console.error('Missing bookingId in booking data:', bookingData);
      alert('Cannot delete: Missing booking ID');
      return;
    }
    console.log(`Deleting booking with roomId=${roomId}, bookingId=${bookingId}`);
    onDeleteBooking(roomId, bookingId);
  };

  return (
    <div className="booking__box">
      <div className="booking__innerbox--left">
        <h3 className="header__heading--sub--alt header__heading--small">{moment(bookingData.bookingStart).format('dddd, MMMM Do YYYY')}</h3>
        <p>{bookingData.purpose}</p>
      </div>
      <div className="booking__innerbox--middle">
        <p>From {startTime} to {endTime}</p>
        <p>Duration {bookingData.duration}hrs</p>
        <p>Level {roomInfo.floor}, {roomInfo.name}</p>
      </div>
      <div className="booking__innerbox--right">
        <Button
          onClick={handleDelete}
          text={`Delete`}
        />
      </div>
    </div>
  )
}

export default BookingElement