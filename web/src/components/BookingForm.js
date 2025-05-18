import React, {Fragment} from 'react'
import BookingFormTable from './BookingFormTable'
import Datetime from 'react-datetime'
import moment from 'moment'
import {Link} from 'react-router-dom'
import Button from './Button'
import { formatTime, startTimeSelectOptions, endTimeSelectOptions } from '../helpers/bookingForm'

function BookingForm({ onMakeBooking, user, roomData, date, updateCalendar, onShowBooking, disableRecurring, onToggleRecurring }) {
  // Disable sunday (day 0) on the calendar as an booking option
  const valid = function(current) {
    return current.day() !== 0
  }

  const handleEndDate = (dateArray) => {
    let recurringEndDate = []
    dateArray.forEach(item => {
      recurringEndDate.push(parseInt(item))
    })
    return recurringEndDate
  }

  // Format the recurring data into an array
  const handleRecurringData = (type, date) => {
    let recurringData = []
    if (type !== "none") {
      recurringData = [ date, type]
      recurringData[0][1] = recurringData[0][1] - 1
    } else {
        recurringData = []
    }
    return recurringData
  }

  // Array used for handleData function
  let dateArray = []

  // Update the current date in the application state
  const handleDate = event => {
    updateCalendar(moment(event)._i)
  }

  // Handle start time change to set end time 1.5 hours later
  const handleStartTimeChange = (event) => {
    const startTime = event.target.value
    const endTimeSelect = document.querySelector('select[name="endTime"]')
    
    if (startTime && endTimeSelect) {
      // Parse the start time value
      const [hours, minutes] = startTime.split(':').map(num => parseInt(num, 10))
      
      // Calculate time 1.5 hours later
      let endHour = hours
      let endMinutes = minutes
      
      // Add 1.5 hours (90 minutes)
      endHour += 1
      endMinutes += 30
      
      // Handle minute overflow
      if (endMinutes >= 60) {
        endHour += 1
        endMinutes -= 60
      }
      
      // Format the end time string to match the format in the select options
      const formattedEndTime = `${endHour}:${endMinutes === 0 ? '00' : endMinutes}`
      
      // Find the closest available end time option if exact match isn't available
      let found = false
      for (let i = 0; i < endTimeSelectOptions.length; i++) {
        const option = endTimeSelectOptions[i]
        if (option.props.value === formattedEndTime) {
          endTimeSelect.value = formattedEndTime
          found = true
          break
        }
      }
      
      // If exact match not found, find the next available time slot
      if (!found) {
        // Find the next available time slot
        for (let i = 0; i < endTimeSelectOptions.length; i++) {
          const optionValue = endTimeSelectOptions[i].props.value
          const [optHours, optMinutes] = optionValue.split(':').map(num => parseInt(num, 10))
          
          // Compare times (convert both to minutes for easy comparison)
          const endTimeInMinutes = (endHour * 60) + endMinutes
          const optionTimeInMinutes = (optHours * 60) + optMinutes
          
          if (optionTimeInMinutes >= endTimeInMinutes) {
            endTimeSelect.value = optionValue
            break
          }
        }
      }
    }
  }
  
  // Set default end time on component render
  setTimeout(() => {
    const startTimeSelect = document.querySelector('select[name="startTime"]')
    if (startTimeSelect) {
      handleStartTimeChange({ target: { value: startTimeSelect.value } })
    }
  }, 100)

  return (
    <Fragment>
      <div className="header__page">
        <h2 className="header__heading header__heading--sub">Level {roomData.floor} | {roomData.name}</h2>
      </div>
      <form className="form__grid form--booking" onSubmit={event => {
          event.preventDefault()
          // Extract date array from current date in state
          const dateArray = moment(date)
            .format('Y M D')
            .split(' ')
            .map(item => parseInt(item, 10))
            dateArray[1] = dateArray[1] - 1
            // Data from input
            const formData = event.target.elements
            const roomId = roomData._id
            
            // Debug the selected times
            console.log('Form start time:', formData.startTime.value)
            console.log('Form end time:', formData.endTime.value)
            
            // startDate data - ensure correct format
            const startTime = formatTime(formData.startTime.value)
            const startDate = [...dateArray, ...startTime]
            // endDate data - ensure correct format
            const endTime = formatTime(formData.endTime.value)
            const endDate = [...dateArray, ...endTime]
            
            // Log the arrays for debugging
            console.log('Date array:', dateArray)
            console.log('Start time array:', startTime)
            console.log('End time array:', endTime)
            console.log('Complete start date array:', startDate)
            console.log('Complete end date array:', endDate)
            
            // Booking specifics
            let recurringEnd = handleEndDate(formData.recurringEndDate.value.split('-'))
            const recurringType = formData.recurring.value
            let recurringData = handleRecurringData(recurringType, recurringEnd)
            const purpose = formData.purpose.value
            const description = formData.description.value
            
            console.log('Submitting booking with description:', description)
            
          onMakeBooking({ 
            startDate, 
            endDate, 
            purpose, 
            roomId, 
            recurringData,
            description 
          })
        }}>
        <div className="content__calendar">
          <Datetime
            dateFormat="YYYY-MM-DD"
            timeFormat={false}
            input={false}
            utc={true}
            isValidDate={valid}
            onChange={event => handleDate(event._d)}
        />
        </div>
        <div className="content__table">
          <BookingFormTable roomData={roomData} date={date} onShowBooking={onShowBooking} />
        </div>
        <div className="content__form">
          <h3 className="header__heading header__heading--column">Make a Booking</h3>
          <div className="form__group form__group--margin-top">
            <label className="form__label form__label--booking">
              {'Start time'}
              <select name="startTime" className="form__input form__input--select" onChange={handleStartTimeChange}>
                {startTimeSelectOptions.map(option => {
                  return option
                })}
              </select>
            </label>
          </div>
          <div className="form__group">
            <label className="form__label form__label--booking">
              {'End time'}
              <select name="endTime" className="form__input form__input--select">
                {endTimeSelectOptions.map(option => {
                  return option
                })}
              </select>
            </label>
          </div>
          <div className="form__group">
            <label className="form__label form__label--booking">
              {'Recurring'}
              <span>
                <select name="recurring" defaultValue="none" onChange={(event) => onToggleRecurring(event.target.value)} className="form__input form__input--select">
                  <option value="none">Non recurring</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </span>
            </label>
          </div>
          <label className="form__label form__label--booking">
            {'Recurring end date'}
            <input type="date" name="recurringEndDate" disabled={disableRecurring} className="form__input--date"/>
          </label>
          <div className="form__group">
            <label className="form__label form__label--booking">
              {'Purpose'}
              <select name="purpose" defaultValue="Scheduled class" className="form__input form__input--select">
                <option value="Scheduled Class">Scheduled class</option>
                <option value="Special Event">Special event</option>
                <option value="Ad-hoc Event">Ad-hoc event</option>
              </select>
            </label>
          </div>
          <div className="form__group">
            <label className="form__label form__label--booking">
              {'Description'}
              <textarea type="textarea" name="description" className="form__input--textarea"></textarea>
            </label>
          </div>
          <div className="form__group--button">
            <Button className="button button__form--booking" text={'Submit'} />
            <Link to="/bookings" className="button button--alternative button__form--booking" >View availability</Link>
          </div>
        </div>
      </form>
    </Fragment>
  )
}

export default BookingForm
