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
        <div className="avatar"><img src={Avatar}/></div>
        <h2>{user}</h2>
      </div>
      
      {/* Debug information section */}
      <div className="debug-info" style={{margin: '20px', padding: '15px', border: '1px solid #ccc', background: '#f8f8f8'}}>
        <h3>Debug Information</h3>
        <p>Current user email: {user}</p>
        <p>Number of rooms with data: {roomData ? roomData.length : 0}</p>
        <p>Total bookings: {roomData ? roomData.reduce((count, room) => count + (room.bookings ? room.bookings.length : 0), 0) : 0}</p>
        <p>User bookings found: {userBookings ? userBookings.length : 0}</p>
        
        <h4>Make some test bookings:</h4>
        <button onClick={() => window.location.href = "/createbooking"} style={{padding: '5px 10px', margin: '5px'}}>
          Create a Test Booking
        </button>
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
              />)
           ) : (<p>You have not yet made any bookings</p>)
        }
      </div>
    </div>
  )
}

export default MyBookings