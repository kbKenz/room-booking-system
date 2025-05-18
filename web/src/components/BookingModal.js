import React from 'react'
import ReactModal from 'react-modal'
import momentTimezone from 'moment-timezone'
import Button from './Button'
import { findRoomInfo } from '../helpers/bookingForm.js'

const BookingModal = props => {
  const deleteBooking = () => {
    // First check if the booking has the required properties
    if (!props.selectedBooking || 
        !props.selectedBooking.roomId || 
        !props.selectedBooking._id) {
      alert('Unable to delete this booking - missing booking information')
      props.onCloseBooking()
      return
    }
    
    const roomID = props.selectedBooking.roomId
    const bookingID = props.selectedBooking._id
    props.onDeleteBooking(roomID, bookingID)
    props.onCloseBooking()
  }
  
  // Safe way to get room info with fallbacks
  const getRoomInfo = () => {
    if (!props.selectedBooking || !props.roomData) {
      return { name: 'Room not found', floor: 'N/A' }
    }
    
    // Check if roomId exists in the booking
    if (!props.selectedBooking.roomId) {
      return { name: 'Room not found', floor: 'N/A' }
    }
    
    return findRoomInfo(props.selectedBooking.roomId, props.roomData)
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
  
  // Only render if we have a selected booking
  if (!props.selectedBooking) {
    return null
  }
  
  const roomInfo = getRoomInfo()
  
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
          {roomInfo.name}{', Level '}{roomInfo.floor}
        </p>
        <p className="modal__paragraph">
          {formatBookingTime()}
        </p>
        <p className="modal__paragraph">
          {formatBookingDate()}
        </p>
        <p className="modal__paragraph">
          <strong>Business Unit </strong>{props.selectedBooking.businessUnit || 'Not specified'}
        </p>
        <p className="modal__paragraph">
          <strong>Purpose </strong>{props.selectedBooking.purpose || 'Not specified'}
        </p>
        <p className="modal__paragraph">
          <strong>Description </strong>{props.selectedBooking.description || 'No description provided'}
        </p>
      </div>
      <a href={`mailto:${props.user}`} className="button">Contact</a>
      <Button
        onClick={deleteBooking}
        text={`Delete`}
      />
      <Button
        className="button__close button--alternative"
        onClick={props.onCloseBooking}
        text={`Close`}
      />
    </ReactModal>
  )
}

export default BookingModal
