import React, { Component, Fragment } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom'
import './css/style.css'
import moment from 'moment'

import BookingForm from './components/BookingForm'
import Button from './components/Button'
import FilterElement from './components/FilterElement'
import Footer from './components/Footer'
import Key from './components/Key'
import MyBookings from './components/MyBookings'
import NavBar from './components/NavBar'
import RoomsList from './components/RoomsList'
import SignInForm from './components/SignInForm'
import SignUpForm from './components/SignUpForm'

import {
  signIn,
  signOut,
  signUp
} from './api/auth'
import { listRooms } from './api/rooms'
import { getDecodedToken } from './api/token'
import { makeBooking, deleteBooking, updateStateRoom } from './api/booking'
import Calendar from './components/Calendar'
import BookingModal from './components/BookingModal'
import { floorParams, filterParams, capacityParams, onFilterByFloor, onFilterByFeature, onFilterByCapacity, onFilterByAvailablity } from './helpers/filters'
import { initialRoom } from './helpers/rooms'
import { transformRoomData } from './utils/dataAdapter'

class App extends Component {
  state = {
    decodedToken: getDecodedToken(), // retrieves the token from local storage if valid, else will be null
    roomData: null,
    userBookings: null,
    calendarDate: new Date(),
    selectedBooking: null,
    filterParams: filterParams,
    capacityParams: capacityParams,
    floorParam: 'all',
    availabilityParam: 'all',
    filteredData: null,
    checked: null,
    currentRoom: null,
    error: null,
    disableRecurring: true
  }

  // Pass supplied first name, lastname, email & password to the signUp function, returns the user's token
  onSignUp = ({ firstName, lastName, email, password }) => {
    signUp({ firstName, lastName, email, password }).then(decodedToken => {
      this.setState({ decodedToken })
    })
  }

  // Pass supplied email & password to the signIn function, returns the users token
  onSignIn = ({ email, password }) => {
    signIn({ email, password }).then(decodedToken => {
      this.setState({ decodedToken })
    })
  }

  // Removes the current token from local storage
  onSignOut = () => {
    signOut()
    this.setState({ decodedToken: null })
  }

  setCalendarDate = date => {
    this.setState({ calendarDate: date })
    
    // Ensure roomData is fetched for this specific date
    this.getRoomData()
  }

  onShowBooking = booking => {
    const selectedBooking = booking
    console.log('selectedBooking', selectedBooking)
    this.setState(() => ({ selectedBooking }))
  }

  onCloseBooking = () => {
    this.setState(() => ({ selectedBooking: null }))
  }

  // Makes a booking by updating the database and the React state
  onMakeBooking = ({ startDate, endDate, businessUnit, purpose, roomId, recurringData, description }) => {
    const bookingData = { startDate, endDate, businessUnit, purpose, roomId, description }
    const existingBookings = this.state.currentRoom.bookings

    // Check if there is a clash and, if not, save the new booking to the database
    try {
      makeBooking(
        { startDate, endDate, businessUnit, purpose, roomId, recurringData, description },
        existingBookings
      )
        .then(updatedRoom => {
          // If the new booking is successfully saved to the database
          alert(`${updatedRoom.name} successfully booked.`)
          updateStateRoom(this, updatedRoom, this.loadMyBookings)
        })
    } catch (err) {
      // If there is a booking clash and the booking could not be saved
      alert(
        'Your booking could not be saved. Please ensure it does not clash with an existing booking and that it is a valid time in the future.'
      )
      console.log(err)
    }
  }

  // Deletes a booking from the database and updates the React state
  onDeleteBooking = (roomId, bookingId) => {
    console.log(`Attempting to delete booking: roomId=${roomId}, bookingId=${bookingId}`)
    
    if (!roomId || !bookingId) {
      alert('Unable to delete booking: Missing room ID or booking ID')
      return
    }
    
    // Convert to string to ensure consistent format for API
    const roomIdStr = roomId.toString();
    const bookingIdStr = bookingId.toString();
    
    console.log(`Calling deleteBooking with roomId=${roomIdStr}, bookingId=${bookingIdStr}`);
    
    deleteBooking(roomIdStr, bookingIdStr)
      .then(updatedRoom => {
        console.log('Booking deleted, updated room:', updatedRoom)
        alert('Booking successfully deleted')
        updateStateRoom(
          this,
          updatedRoom,
          this.loadMyBookings,
        )
      })
      .catch(error => {
        console.error('Error deleting booking:', error)
        // Check for specific permission errors
        if (error.message && error.message.includes('Permission denied')) {
          alert('Permission denied: Only admins or the person who created the booking can delete it')
        } else {
          alert('Error deleting booking: ' + (error.message || 'Unknown error'))
        }
      })
  }

  setRoom = id => {
    const room = this.state.roomData.find(room => room._id === id)
    this.setState({ currentRoom: room })
  }

  // setting the feature filter parameters
  onToggleFeature = feature => {
    // Get the filter parameters
    let filterParams = this.state.filterParams
    // Find the filter parameter that matches the the passed parameter
    let featureParam = filterParams.find(param => param.name === feature)
    // Toggle the value of the parameter, eg if false, set to true
    featureParam.value = !featureParam.value
    // Set state with the updated filter parameters
    this.setState({ filterParams: filterParams })
  }

  // setting the capacity filter parameters
  onToggleCapacity = capacity => {
    // Get the capacity parameters
    let capacityParams = this.state.capacityParams
    // Find the capacity parameter that matches the the passed parameter
    let capacityParam = capacityParams.find(param => param.id === capacity)
    // Toggle the value of the parameter, eg if false, set to true
    capacityParam.value = !capacityParam.value
    // Set state with the updated capacity parameters
    this.setState({ capacityParams: capacityParams })
  }

  // changing the boolean value for the display attribute for the recurring date input
  onToggleRecurring = (value) => {
    let disableRecurring
    if (value === 'none') {
      disableRecurring = true
    } else {
      disableRecurring = false
    }
    this.setState({disableRecurring: disableRecurring})
  }

  onSetFloorParam = value => {
		this.setState({ floorParam: value })
  }

  onSetAvailabilityParam = availability => {
    this.setState({ availabilityParam: availability })
  }

  // get today's bookings for all rooms
  oneSetCurrentDateBookings = () => {
    const currentDate = moment().format('DD-MM-YYYY')
    // const roomData = this.state.roomData
    const roomData = this.state.roomData
    // array to collect todays bookings
    let todaysBookings = []
    // loop through all rooms
    roomData.forEach(room => {
      // loop through all bookings for that room
      room.bookings.forEach(booking => {
        const bookingStart = moment(booking.bookingStart).format('DD-MM-YYYY')
        if (bookingStart === currentDate) {
          todaysBookings.push(booking)
        }
      })
    })
    console.log('todays bookings:', todaysBookings)
    // return todaysBookings
  }

  loadMyBookings = () => {
    let myBookings = [];
    
    // Guard clause to prevent errors if decodedToken or roomData is missing
    if (!this.state.decodedToken || !this.state.roomData) {
      console.log('User token or room data not available');
      this.setState({ userBookings: [] });
      return;
    }
    
    // Get multiple possible user identifiers from token
    const userId = this.state.decodedToken.sub || this.state.decodedToken.user_id || this.state.decodedToken.id;
    const userEmail = this.state.decodedToken.email || this.state.decodedToken.user_email;
    
    console.log('Current user ID from token:', userId);
    console.log('Current user email from token:', userEmail);
    console.log('Room data available:', this.state.roomData.length);
    
    if (!userId && !userEmail) {
      console.log('WARNING: No user ID or email found in token!', this.state.decodedToken);
    }
    
    // Loop through all the rooms
    this.state.roomData.forEach((room, index) => {
      // Make sure room.bookings exists
      if (room.bookings && Array.isArray(room.bookings)) {
        console.log(`Room ${room.name} has ${room.bookings.length} bookings`);
        
        // Log the first booking details to check the structure
        if (room.bookings.length > 0) {
          console.log('Sample booking structure:', JSON.stringify(room.bookings[0]));
        }
        
        // Loop through all the bookings in 'room'
        room.bookings.forEach(booking => {
          // Log each booking for debugging
          // console.log(`Checking booking:`, booking);
          
          // Extract all possible ID/email fields from booking
          const bookingUserId = booking.user || booking.userId || booking.UserId || booking.user_id;
          const bookingUserEmail = booking.userEmail || booking.user_email;
          
          // Compare IDs and emails (case-insensitive for emails)
          const idMatches = userId && bookingUserId && 
                           (String(bookingUserId) === String(userId) || 
                            parseInt(bookingUserId) === parseInt(userId));
                            
          const emailMatches = userEmail && bookingUserEmail && 
                              bookingUserEmail.toLowerCase() === userEmail.toLowerCase();
          
          // Check if this booking belongs to the current user
          if (idMatches || emailMatches) {
            // Add room ID to the booking for easier reference
            booking.roomId = room._id || room.id;
            
            // Make sure the booking has the user info
            if (!booking.userEmail && userEmail) {
              booking.userEmail = userEmail;
            }
            if (!booking.user && userId) {
              booking.user = userId;
            }
            
            myBookings.push(booking);
            console.log('Found matching booking:', booking);
          }
        });
      }
    });
    
    console.log('Found user bookings:', myBookings.length);
    this.setState({ userBookings: myBookings });
  }

  // Fetch room data from the API based on current calendar date
  getRoomData = () => {
    const { decodedToken } = this.state
    const signedIn = !!decodedToken
    
    if (signedIn) {
      // display loading page
      this.setState({ loading: true })
      
      // load all of the rooms from the database
      listRooms()
        .then(rooms => {
          // Transform the room data if necessary
          let formattedRooms = rooms;
          // Check if the data format is different than expected
          if (rooms && rooms.length > 0 && !rooms[0]._id && rooms[0].id) {
            formattedRooms = transformRoomData(rooms);
          }
          this.setState({ roomData: formattedRooms })

          // load the current user's bookings
          this.loadMyBookings()
          
          // the state's current room defaults to first room if rooms exist
          if (formattedRooms && formattedRooms.length > 0 && !this.state.currentRoom) {
            const room = formattedRooms[0];
            this.setRoom(room._id)
          }
          
          // toggle loading page off
          this.setState({ loading: false })
        })
        .catch(error => {
          console.error('Error loading room data', error)
          this.setState({ error, loading: false })
        })
    }
  }

  render() {
    const {
      decodedToken,
      currentRoom,
      userBookings,
      roomData,
      calendarDate,
      selectedBooking,
      filterParams,
      capacityParams,
      floorParam,
      availabilityParam,
      disableRecurring,
      loading
    } = this.state
    const signedIn = !!decodedToken
    const signOut = this.onSignOut
    const loadMyBookings = this.loadMyBookings
    const onDeleteBooking = this.onDeleteBooking
    const setCalendarDate = this.setCalendarDate
    const Loading = require('react-loading-animation')

    let filteredData = []
    const featureParams = this.state.filterParams
    const date = this.state.currentDate

    if (!!roomData) {
      // Send all room data and the selected floor, return filtered floors and store in filteredData
      filteredData = onFilterByFloor(floorParam, roomData)
      // Send the previously filtered data along with the feature params
      filteredData = onFilterByFeature(featureParams, filteredData)
      // Send the previously filtered data along with the capacity params
      filteredData = onFilterByCapacity(capacityParams, filteredData)
      // Send the previously filtered data along with the availability
      filteredData = onFilterByAvailablity(availabilityParam, filteredData)
    }

    const requireAuth = render => () =>
      signedIn ? render() : <Redirect to="/" />

    return (
      <Router>
        <div id="app" className="App">
          <Fragment>
              <Switch>
                <Route path="/" exact render={() => (!!decodedToken && signedIn ?
                  (<Redirect to="/bookings" />) :
                  (<div className="wrapper__form">
                      <div className="header__page">
                        <h2 className="header__heading header__heading--sub--alt">Sign in with email</h2>
                      </div>
                      <SignInForm onSignIn={this.onSignIn} />
                      <h3 className="header__heading header__heading--sub--alt">Don't have an account?</h3>
                      <SignUpForm onSignUp={this.onSignUp} />
                    </div>
                  )
                )} />

                <Route path="/bookings" exact render={requireAuth(() => (
                  <Fragment>
                    { !!decodedToken && !roomData && loading && (
                      <div className="loading_animation">
                        <Loading />
                      </div>
                    ) }
                    {!!decodedToken && !!roomData && !loading && (
                      <div className="wrapper">
                        <div className="header header__nav header--flex">
                          <h1 className="header__heading header__heading--main">Salymbekov University</h1>
                          <NavBar
                            signOut={signOut}
                            loadMyBookings={loadMyBookings}
                            user={signedIn ? decodedToken.sub : null}
                          />
                        </div>
                        <div className="wrapper__content">
                          <div className="header__page">
                            <h2 className="header__heading header__heading--sub">Book a room | {moment(calendarDate).format('MMMM Do YYYY')}</h2>
                          </div>
                          <div className="sidebar">
                            <div className="sidebar__box">
                              <Calendar setCalendarDate={setCalendarDate} />
                            </div>
                            <div className="sidebar__box">
                              <FilterElement
                                onSetFloorParam={this.onSetFloorParam}
                                onToggleFeature={this.onToggleFeature}
                                onToggleCapacity={this.onToggleCapacity}
                                onSetAvailabilityParam={
                                  this.onSetAvailabilityParam
                                }
                                filterParams={filterParams}
                                capacityParams={capacityParams}
                                floorParam={floorParam}
                                availabilityParam={availabilityParam}
                                onSetTimeFilterParams={this.onSetTimeFilterParams}
                                date={calendarDate}
                              />
                            </div>
                            <div className="sidebar__box">

                            </div>
                          </div>
                          <div className="content">
                            <RoomsList
                              rooms={filteredData}
                              onRoomSelect={this.onRoomSelect}
                              onShowBooking={this.onShowBooking}
                              date={calendarDate}
                              onSetRoom={this.setRoom}
                            />
                          </div>
                         </div>
                        <BookingModal
                          selectedBooking={selectedBooking}
                          onCloseBooking={this.onCloseBooking}
                          onDeleteBooking={onDeleteBooking}
                          roomData={roomData}
                          user={decodedToken.email}
                        />
                      </div>
                    )}
                  </Fragment>
                ))} />

                <Route path="/createbooking" exact render={requireAuth(
                  () => (
                    <Fragment>
                      {!!decodedToken &&
                        !!roomData &&
                        !!currentRoom && (
                          <div className="wrapper">
                            <header className="header header__nav header--flex">
                              <h1 className="header__heading header__heading--main">Salymbekov University</h1>
                              <NavBar
                                signOut={signOut}
                                loadMyBookings={loadMyBookings}
                                user={signedIn ? decodedToken.sub : null}
                              />
                            </header>
                            <div className="wrapper__content">
                              <BookingForm
                                user={decodedToken.email}
                                roomData={currentRoom}
                                onMakeBooking={this.onMakeBooking}
                                date={calendarDate}
                                disableRecurring={disableRecurring}
                                updateCalendar={setCalendarDate}
                                onShowBooking={this.onShowBooking}
                                onToggleRecurring={this.onToggleRecurring}
                              />
                            </div>
                            <BookingModal
                              selectedBooking={selectedBooking}
                              onCloseBooking={this.onCloseBooking}
                              onDeleteBooking={onDeleteBooking}
                              roomData={roomData}
                              user={decodedToken.email}
                            />
                          </div>
                        )}
                    </Fragment>
                  )
                )} />

                <Route path="/mybookings" exact render={requireAuth(() => (
                    <Fragment>
                      {!!decodedToken &&
                        !!roomData && (
                          <div className="wrapper">
                            <div className="header header__nav header--flex">
                              <h1 className="header__heading header__heading--main">Salymbekov University</h1>
                              <NavBar
                                signOut={signOut}
                                loadMyBookings={loadMyBookings}
                                user={signedIn ? decodedToken.sub : null}
                              />
                            </div>
                            <div className="wrapper__content--bookings">
                              <div className="header__page">
                                <h2 className="header__heading header__heading--sub">My Bookings</h2>
                              </div>
                              <MyBookings
                                roomData={roomData}
                                user={decodedToken.email}
                                userBookings={userBookings}
                                onDeleteBooking={onDeleteBooking}
                              />
                            </div>
                          </div>
                        )}
                    </Fragment>
                  ))} />

                <Route render={({ location }) => <h2>
                      {' '}
                      Page Not Found: {location.pathname}{' '}
                    </h2>} />
            </Switch>
          </Fragment>
        </div>
      </Router>
    )
  }

  // When the App first renders
  componentDidMount() {
    this.load()
  }

  // When state changes
  componentDidUpdate(prevProps, prevState) {
    // If just signed in, signed up, or signed out,
    // then the token will have changed
    if (this.state.decodedToken !== prevState.decodedToken) {
      this.load()
    }
  }

  // Load initial data
  load() {
    this.getRoomData()
  }
}

export default App
