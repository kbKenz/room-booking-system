import React from 'react'
import { dailyBookings, bookingArray } from '../helpers/rooms'

const ColumnCell = props => {

  // Get the day's bookings for a room
  let bookings = dailyBookings(props.date, props.bookings)

  // Add the day's bookings to a 24 hour array
  let dayHours = bookingArray(bookings)

  // Prepare a booking for display and ensure it has the needed properties
  const prepareBookingForDisplay = (booking) => {
    // Make sure we have a roomId property
    if (!booking.roomId && props.roomId) {
      booking.roomId = props.roomId
    }
    
    // Make sure we have an _id property
    if (!booking._id && booking.id) {
      booking._id = booking.id
    }
    
    return booking
  }

  // Extract the corresponding data for a single hour from the 24 hour array
  let bookingData = dayHours[props.hour]

  // Data to be returned
  let columnData = ''

  // If the data for that hour is a number (not a booking object), there is no booking
  // Return a <td> element that indicates the time slot is available
  if (typeof bookingData == 'number') {
    columnData = <td className="table__cell--available">Available</td>

  // If the data for that hour is an array, this means there are two bookings to be rendered
  } else if (Array.isArray(bookingData)) {
    
    // Determine which of the two bookings comes first and second
    let firstBookingData = bookingData[0].firstHalfHour ?
                            bookingData[0] : bookingData[1]

    let secondBookingData = bookingData[0].secondHalfHour ?
                            bookingData[0] : bookingData[1]

    // Prepare the bookings for display
    firstBookingData = prepareBookingForDisplay(firstBookingData)
    secondBookingData = prepareBookingForDisplay(secondBookingData)

    columnData =
    <table className="table--nested">
      <tbody>
      <tr className="table__row--no-border table__row--border-bottom">
          <td
        onClick={() => props.onShowBooking(firstBookingData)} className={`table__cell--${firstBookingData.purpose
              .replace(/ /g, '-')
            .toLowerCase()} table__cell--subcell`
            }
          >
            {firstBookingData.purpose}
          </td>
        </tr>
        <tr className="table__row--no-border">
          <td
        onClick={() => props.onShowBooking(secondBookingData)} className={`table__cell--${secondBookingData.purpose
              .replace(/ /g, '-')
            .toLowerCase()} table__cell--subcell`
            }
          >
            {secondBookingData.purpose}
          </td>
        </tr>
      </tbody>
    </table>
  
  // If there is a booking object, but only for the first half of the hour, return a nested table to split the table data for that cell into two rows.
  } else if (bookingData.firstHalfHour) {
    // Prepare the booking for display
    bookingData = prepareBookingForDisplay(bookingData)
    
    columnData =
        <table className="table--nested">
          <tbody>
          <tr className="table__row--no-border table__row--border-bottom">
              <td
            onClick={() => props.onShowBooking(bookingData)} className={`table__cell--${bookingData.purpose
                  .replace(/ /g, '-')
                .toLowerCase()} table__cell--subcell`
                }
              >
                {bookingData.purpose}
              </td>
            </tr>
            <tr className="table__row--no-border">
              <td className="table__cell--subcell available">Available</td>
            </tr>
          </tbody>
        </table>

  // If there is a booking object, but only for the second half of the hour, return a nested table to split the table data for that cell into two rows
  } else if (bookingData.secondHalfHour) {
    // Prepare the booking for display
    bookingData = prepareBookingForDisplay(bookingData)
    
    columnData =
        <table className="table--nested">
          <tbody>
          <tr className="table__row--no-border table__row--border-bottom">
              <td className="table__cell--subcell available">Available</td>
            </tr>
            <tr className="table__row--no-border">
          <td onClick={() => props.onShowBooking(bookingData)} className={`table__cell--${bookingData.purpose
                  .replace(/ /g, '-')
                  .toLowerCase()} table__cell--subcell`
                }
              >
                {bookingData.purpose}
              </td>
            </tr>
          </tbody>
        </table>

  // If there is a booking object for the full hour, return a single <td> cell
  } else {
    // Prepare the booking for display
    bookingData = prepareBookingForDisplay(bookingData)
    
    columnData =
      <td
        onClick={() => props.onShowBooking(bookingData)}
      className={`table__cell--${bookingData.purpose
          .replace(/ /g, '-')
          .toLowerCase()}`
        }>
          {bookingData.purpose}
      </td>
  }
  return columnData
}

export default ColumnCell
