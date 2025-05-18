import React from 'react'
import BookingElement from './BookingElement'
import Avatar from '../assets/avatar.png'

function MyBookings({
  user,
  userBookings,
  onDeleteBooking,
  roomData
}) {
  console.log('MyBookings component - userBookings:', userBookings);
  console.log('MyBookings component - user:', user);
  console.log('MyBookings component - roomData:', roomData);

  return (
    <div className="wrapper__bookings">
      <div className="booking__user-info">
        <h2>{user}</h2>
      </div>
      
      <div className="user-booking-container">
        { userBookings && userBookings.length > 0 ?
          (
            userBookings.map((booking, index) =>
              <BookingElement
                key={index}
                roomData={roomData}
                bookingData={booking}
                onDeleteBooking={onDeleteBooking}
                currentUserEmail={user}
                isMyBookingsView={true}
              />)
           ) : (<p>You have not yet made any bookings</p>)
        }
      </div>
    </div>
  )
}

export default MyBookings