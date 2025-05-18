import React from 'react'
import moment from 'moment'
import momentTimezone from 'moment-timezone'
import Button from './Button'
import { findRoomInfo } from '../helpers/bookingForm.js'
import { getDecodedToken } from '../api/token'

function BookingElement({
  bookingData,
  onDeleteBooking,
  roomData,
  currentUserEmail,
  isMyBookingsView
}) {
  // Log booking data to debug IDs
  console.log('BookingElement - bookingData:', bookingData);
  
  // Get current user info from token
  const currentUser = getDecodedToken();
  console.log('Current user token data (BookingElement):', currentUser);
  
  // Extract user data from the token - check all possible field names
  const isCurrentUserAdmin = currentUser && currentUser.isAdmin === true;
  const tokenUserEmail = currentUser ? (currentUser.email || currentUser.user_email) : '';
  const currentUserId = currentUser ? (currentUser.sub || currentUser.user_id || currentUser.id) : '';
  
  // Use passed email if available (more reliable), otherwise fall back to token
  const effectiveUserEmail = currentUserEmail || tokenUserEmail;
  
  // Handle both possible field names for IDs
  const roomId = bookingData.roomId || bookingData.RoomId;
  const bookingId = bookingData.id || bookingData._id || bookingData.id;
  
  // Check if this booking belongs to current user
  const bookingUserEmail = bookingData.userEmail || bookingData.user_email;
  const bookingUserId = bookingData.UserId || bookingData.userId || bookingData.user || bookingData.user_id;
  
  // Force convert emails to lowercase for comparison
  console.log('Booking user email:', bookingUserEmail);
  console.log('Current user email:', effectiveUserEmail);
  
  // Compare emails case-insensitively
  const emailMatches = bookingUserEmail && effectiveUserEmail && 
                       bookingUserEmail.toLowerCase() === effectiveUserEmail.toLowerCase();
                      
  // Compare IDs with string conversion
  const idMatches = bookingUserId && currentUserId && 
                   String(bookingUserId) === String(currentUserId);
  
  console.log('Email match:', emailMatches);
  console.log('ID match:', idMatches);
  
  // Determine if user can delete this booking (admin or own booking)
  const canDelete = isCurrentUserAdmin || emailMatches || idMatches;
  
  // If we're in MyBookings view, this booking belongs to current user by definition
  const finalCanDelete = isMyBookingsView || canDelete;
  
  console.log(`Delete would use roomId=${roomId}, bookingId=${bookingId}`);
  console.log(`Can this user delete the booking? ${finalCanDelete}`);
  console.log(`User data: isAdmin=${isCurrentUserAdmin}, email=${effectiveUserEmail}, id=${currentUserId}`);
  console.log(`Booking user: email=${bookingUserEmail}, id=${bookingUserId}`);

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
        <p className="booking__user">Booked by: {bookingUserEmail || 'Unknown user'}</p>
      </div>
      <div className="booking__innerbox--middle">
        <p>From {startTime} to {endTime}</p>
        <p>Duration {bookingData.duration}hrs</p>
        <p>Level {roomInfo.floor}, {roomInfo.name}</p>
      </div>
      <div className="booking__innerbox--right">
        {finalCanDelete ? (
          <Button
            onClick={handleDelete}
            text={`Delete`}
          />
        ) : (
          <p className="booking__no-permission">No delete permission</p>
        )}
      </div>
    </div>
  )
}

export default BookingElement