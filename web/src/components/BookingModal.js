import React from 'react'
import ReactModal from 'react-modal'
import momentTimezone from 'moment-timezone'
import Button from './Button'
import { findRoomInfo } from '../helpers/bookingForm.js'
import { getDecodedToken } from '../api/token'

const BookingModal = props => {
  // Get current user info from token
  const currentUser = getDecodedToken();
  console.log('Current user token data:', currentUser);
  
  // Extract user data from the token - check all possible field names
  const isCurrentUserAdmin = currentUser && currentUser.isAdmin === true;
  const currentUserEmail = currentUser ? (currentUser.email || currentUser.user_email) : '';
  const currentUserId = currentUser ? (currentUser.sub || currentUser.user_id || currentUser.id) : '';
  
  console.log('Extracted user data:', {
    isAdmin: isCurrentUserAdmin,
    email: currentUserEmail,
    id: currentUserId
  });
  
  // If email is not in token but we have a user prop from the modal, use that
  const userEmailFromProps = props.user;
  const effectiveUserEmail = currentUserEmail || userEmailFromProps;
  
  console.log('Using email for permission check:', effectiveUserEmail);
  
  // Check if this booking belongs to current user
  const canUserDeleteBooking = () => {
    if (!props.selectedBooking) return false;
    
    // If user is admin, they can delete any booking
    if (isCurrentUserAdmin) {
      console.log('User is admin, can delete any booking');
      return true;
    }
    
    // Get booking user info - check all possible fields
    const bookingUserEmail = props.selectedBooking.userEmail || 
                             props.selectedBooking.user_email;
                            
    const bookingUserId = props.selectedBooking.UserId || 
                          props.selectedBooking.userId || 
                          props.selectedBooking.user || 
                          props.selectedBooking.user_id;
    
    // Compare emails case-insensitively
    const emailMatches = bookingUserEmail && effectiveUserEmail && 
                        bookingUserEmail.toLowerCase() === effectiveUserEmail.toLowerCase();
                        
    // Compare IDs with string conversion
    const idMatches = bookingUserId && currentUserId && 
                     String(bookingUserId) === String(currentUserId);
    
    console.log('Email comparison:', { 
      bookingEmail: bookingUserEmail, 
      currentEmail: effectiveUserEmail,
      emailMatches: emailMatches 
    });
    
    console.log('ID comparison:', { 
      bookingUserId: bookingUserId, 
      currentUserId: currentUserId,
      idMatches: idMatches 
    });
    
    // User can delete if it's their booking (by email or ID)
    return emailMatches || idMatches;
  };
  
  const deleteBooking = () => {
    // Make sure the booking exists
    if (!props.selectedBooking) {
      alert('Unable to delete this booking - missing booking information')
      props.onCloseBooking()
      return
    }
    
    // Get room ID - try different potential property names
    const roomID = props.selectedBooking.roomId || props.selectedBooking.RoomId || props.selectedBooking.room_id || props.selectedBooking.room
    
    // Get booking ID - try different potential property names
    const bookingID = props.selectedBooking.id || props.selectedBooking._id || props.selectedBooking.booking_id
    
    // Log the values for debugging
    console.log('Deleting booking:', { roomID, bookingID, selectedBooking: props.selectedBooking })
    
    // Make sure we have both IDs
    if (!roomID || !bookingID) {
      alert('Unable to delete this booking - missing booking information')
      props.onCloseBooking()
      return
    }
    
    // Check permissions
    if (!canUserDeleteBooking()) {
      alert('Permission denied: Only admins or the booking creator can delete bookings')
      props.onCloseBooking()
      return
    }
    
    props.onDeleteBooking(roomID, bookingID)
    props.onCloseBooking()
  }
  
  // Safe way to get room info with fallbacks
  const getRoomInfo = () => {
    if (!props.selectedBooking || !props.roomData) {
      return { name: 'Room not found', floor: 'N/A' }
    }
    
    // Check if roomId exists in the booking
    const roomId = props.selectedBooking.roomId || props.selectedBooking.room;
    if (!roomId) {
      return { name: 'Room not found', floor: 'N/A' }
    }
    
    return findRoomInfo(roomId, props.roomData)
  }
  
  // Format times safely to prevent errors
  const formatBookingTime = () => {
    try {
      if (!props.selectedBooking.bookingStart || !props.selectedBooking.bookingEnd) {
        return 'Time not available'
      }
      
      return `${momentTimezone
          .tz(props.selectedBooking.bookingStart, 'Australia/Sydney')
          .format('h.mma')} to ${momentTimezone
          .tz(props.selectedBooking.bookingEnd, 'Australia/Sydney')
          .format('h.mma')}`
    } catch (error) {
      console.error('Error formatting booking time:', error)
      return 'Time not available'
    }
  }
  
  // Format dates safely to prevent errors
  const formatBookingDate = () => {
    try {
      if (!props.selectedBooking.bookingStart || !props.selectedBooking.bookingEnd) {
        return 'Date not available'
      }
      
      return `${momentTimezone
          .tz(props.selectedBooking.bookingStart, 'Australia/Sydney')
          .format('MMMM Do, YYYY')} to ${momentTimezone
          .tz(props.selectedBooking.bookingEnd, 'Australia/Sydney')
          .format('MMMM Do, YYYY')}`
    } catch (error) {
      console.error('Error formatting booking date:', error)
      return 'Date not available'
    }
  }
  
  // Get the booker's information using available properties
  const getBookerInfo = () => {
    if (!props.selectedBooking) return 'Unknown'
    
    // Try all possible properties where the user/booker info might be stored
    return props.selectedBooking.user_email || 
           props.selectedBooking.userEmail || 
           (props.selectedBooking.user && props.selectedBooking.user.email) ||
           props.selectedBooking.bookedBy ||
           props.user || 
           'Not specified'
  }
  
  // Only render if we have a selected booking
  if (!props.selectedBooking) {
    return null
  }
  
  const roomInfo = getRoomInfo()
  const bookerInfo = getBookerInfo()
  const showDeleteButton = canUserDeleteBooking();
  
  console.log('Current user:', {
    email: currentUserEmail,
    id: currentUserId,
    isAdmin: isCurrentUserAdmin
  });
  console.log('Can delete?', showDeleteButton);
  console.log('Booking creator email:', bookerInfo);
  
  return (
    <ReactModal
      isOpen={!!props.selectedBooking}
      onRequestClose={props.onCloseBooking}
      ariaHideApp={true}
      shouldFocusAfterRender={true}
      shouldReturnFocusAfterClose={true}
      contentLabel="Booking"
      appElement={document.getElementById('app')}
      closeTimeoutMS={200}
      className="modal"
    >
      <h3 className="modal__title">Booking Details</h3>
      <div className="modal__boday">
        <p className="modal__paragraph">
          {roomInfo.name}{', Floor '}{roomInfo.floor}
        </p>
        <p className="modal__paragraph">
          {formatBookingTime()}
        </p>
        <p className="modal__paragraph">
          {formatBookingDate()}
        </p>
        <p className="modal__paragraph">
          <strong>Booked by: </strong>{bookerInfo}
        </p>
        <p className="modal__paragraph">
          <strong>Purpose </strong>{props.selectedBooking.purpose || 'Not specified'}
        </p>
        <p className="modal__paragraph">
          <strong>Description </strong>{props.selectedBooking.description || 'No description provided'}
        </p>
      </div>
      <a href={`mailto:${bookerInfo}`} className="button">Contact</a>
      
      {showDeleteButton ? (
        <Button
          onClick={deleteBooking}
          text={`Delete`}
        />
      ) : (
        <p className="modal__no-permission">Only admins or the booking creator can delete this booking</p>
      )}
      
      <Button
        className="button__close button--alternative"
        onClick={props.onCloseBooking}
        text={`Close`}
      />
    </ReactModal>
  )
}

export default BookingModal
