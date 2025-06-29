import moment from "moment";
import momentTimezone from "moment-timezone";
import api from "./init";
import { transformRoomData } from "../utils/dataAdapter";

// Function to convert date array to ISO string for backend compatibility
const arrayToISOString = (dateArray) => {
  console.log("Converting array to ISO string:", dateArray);

  let year, month, day, hour, minute;

  if (dateArray.length === 3) {
    // Date only - use end of day (23:59)
    [year, month, day] = dateArray;
    hour = 23;
    minute = 59;
  } else if (dateArray.length === 5) {
    // Full datetime
    [year, month, day, hour, minute] = dateArray;
  } else {
    throw new Error(
      `Invalid date array: expected 3 or 5 elements, got ${dateArray.length}`
    );
  }

  // Create ISO string - note that month needs +1 for ISO format (1-12) vs our format (0-11)
  const isoString = `${year}-${String(month + 1).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(
    minute
  ).padStart(2, "0")}:00Z`;

  console.log("Converted to ISO string:", isoString);
  return isoString;
};

// Function to receive booking data (AEST) and convert to JS Date object
// Data expected in [year, month, date, hours, minutes] format or [year, month, date] format
const dateUTC = (dataArray) => {
  // Don't apply the timezone twice - the data is already in Sydney time
  // Just create a date object directly from the array
  console.log("Creating date from array:", dataArray);

  // Handle both 3-element (date only) and 5-element (datetime) arrays
  let year, month, day, hour, minute;

  if (dataArray.length === 3) {
    // Date only - set default time to end of day (23:59) for more intuitive recurring end dates
    [year, month, day] = dataArray;
    hour = 23;
    minute = 59;
    console.log("Date-only array detected, using end of day time 23:59");
  } else if (dataArray.length === 5) {
    // Full datetime array
    [year, month, day, hour, minute] = dataArray;
    console.log("Full datetime array detected");
  } else {
    console.error("Invalid date array length:", dataArray.length, dataArray);
    throw new Error(
      `Invalid date array: expected 3 or 5 elements, got ${dataArray.length}`
    );
  }

  // Create the date string in ISO format (YYYY-MM-DDTHH:MM:00)
  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(
    minute
  ).padStart(2, "0")}:00`;

  console.log("ISO date string:", dateStr);

  // Create a moment in Sydney timezone
  const sydneyTime = momentTimezone.tz(dateStr, "Australia/Sydney");
  console.log("Sydney time:", sydneyTime.format());

  // Convert to UTC time
  return sydneyTime.toDate();
};

// Make a room booking
export function makeBooking(data, existingBookings) {
  // Convert booking data to UTC Date objects
  let bookingStart = dateUTC(data.startDate);
  let bookingEnd = dateUTC(data.endDate);

  // Log the original and converted times for debugging
  console.log("Original startDate array:", data.startDate);
  console.log("Original endDate array:", data.endDate);
  console.log("Converted bookingStart:", bookingStart);
  console.log("Converted bookingEnd:", bookingEnd);

  // Also log in readable format
  console.log(
    "Booking time (Sydney):",
    momentTimezone
      .tz(bookingStart, "Australia/Sydney")
      .format("YYYY-MM-DD HH:mm"),
    "to",
    momentTimezone.tz(bookingEnd, "Australia/Sydney").format("YYYY-MM-DD HH:mm")
  );

  // Convert booking Date objects into a number value
  let newBookingStart = bookingStart.getTime();
  let newBookingEnd = bookingEnd.getTime();

  // Check whether the new booking times overlap with any of the existing bookings
  let bookingClash = false;

  existingBookings.forEach((booking) => {
    // Convert existing booking Date objects into number values
    let existingBookingStart = new Date(booking.bookingStart).getTime();
    let existingBookingEnd = new Date(booking.bookingEnd).getTime();

    // Check whether there is a clash between the new booking and the existing booking
    if (
      (newBookingStart >= existingBookingStart &&
        newBookingStart < existingBookingEnd) ||
      (existingBookingStart >= newBookingStart &&
        existingBookingStart < newBookingEnd)
    ) {
      // Switch the bookingClash variable if there is a clash
      return (bookingClash = true);
    }
  });

  // Ensure the new booking is valid (i.e. the start time is before the end time, and the booking is for a future time)
  let validDate =
    newBookingStart < newBookingEnd && newBookingStart > new Date().getTime();

  // If a recurring booking as been selected, ensure the end date is after the start date
  console.log("Validating recurring booking...");
  console.log("data.recurringData:", data.recurringData);
  console.log("data.recurringData.length:", data.recurringData.length);

  let validRecurring;
  if (data.recurringData.length > 0) {
    console.log("Processing recurring validation...");
    console.log(
      "data.recurringData[0] (recurring end date array):",
      data.recurringData[0]
    );

    const recurringEndDate = dateUTC(data.recurringData[0]);
    console.log("Converted recurring end date:", recurringEndDate);
    console.log("Recurring end date timestamp:", recurringEndDate.getTime());
    console.log("Booking end timestamp:", newBookingEnd);
    console.log(
      "Is recurring end after booking end?",
      recurringEndDate.getTime() > newBookingEnd
    );

    validRecurring = recurringEndDate.getTime() > newBookingEnd;
  } else {
    console.log("No recurring data, validation passes");
    validRecurring = true;
  }

  console.log("Final validation results:");
  console.log("- bookingClash:", bookingClash);
  console.log("- validDate:", validDate);
  console.log("- validRecurring:", validRecurring);
  console.log(
    "- Can proceed with booking?",
    !bookingClash && validDate && validRecurring
  );

  // Save the booking to the database and return the booking if there are no clashes and the new booking time is not in the past
  if (!bookingClash && validDate && validRecurring) {
    console.log("Sending booking data:", data); // Log the data for debugging

    // Prepare recurring data for backend - convert array format to ISO string format
    let recurringForBackend = [];
    if (data.recurringData.length > 0) {
      const recurringEndDateISO = arrayToISOString(data.recurringData[0]);
      const recurringType = data.recurringData[1];
      recurringForBackend = [recurringEndDateISO, recurringType];
      console.log("Converted recurring data for backend:", recurringForBackend);
    }

    return api
      .put(`/rooms/${data.roomId}`, {
        bookingStart: bookingStart,
        bookingEnd: bookingEnd,
        businessUnit: data.businessUnit,
        purpose: data.purpose,
        description: data.description,
        userEmail: data.user, // Store the user's email
        roomId: data.roomId,
        recurring: recurringForBackend,
      })
      .then((res) => res.data)
      .catch((err) => {
        console.error("API error:", err);
        let errorMessage = "Your booking could not be saved. Please try again.";

        try {
          if (err.response && err.response.data) {
            if (err.response.data.error && err.response.data.error.message) {
              const match = err.response.data.error.message.match(/error:.+/i);
              errorMessage = match ? match[0] : err.response.data.error.message;
            } else if (err.response.data.message) {
              errorMessage = err.response.data.message;
            } else if (typeof err.response.data === "string") {
              errorMessage = err.response.data;
            }
          } else if (err.message) {
            errorMessage = err.message;
          }
        } catch (parseError) {
          console.error("Error parsing API error:", parseError);
        }

        alert(errorMessage);
        throw err;
      });
  } else {
    // Log detailed failure reasons
    console.error("Booking validation failed!");
    if (bookingClash) {
      console.error("Reason: Booking clash with existing booking");
      alert(
        "Your booking could not be saved. Please ensure it does not clash with an existing booking and that it is a valid time in the future."
      );
    } else if (!validDate) {
      console.error(
        "Reason: Invalid date (booking is in the past or end time is before start time)"
      );
      alert(
        "Your booking could not be saved. Please ensure it does not clash with an existing booking and that it is a valid time in the future."
      );
    } else if (!validRecurring) {
      console.error(
        "Reason: Invalid recurring end date (recurring end date is not after booking end date)"
      );
      alert(
        "Your booking could not be saved. The recurring end date must be after the booking date. Please select a valid recurring end date."
      );
    }
    return null;
  }
}

// Delete a room booking
export function deleteBooking(roomId, bookingId) {
  // Ensure IDs are in string format for the API call
  const safeRoomId = roomId.toString();
  const safeBookingId = bookingId.toString();

  console.log(
    `API delete booking call: room=${safeRoomId}, booking=${safeBookingId}`
  );

  // Add detailed data validation
  if (!safeRoomId || safeRoomId === "undefined" || safeRoomId === "null") {
    console.error("Invalid roomId:", roomId);
    return Promise.reject(new Error("Invalid room ID"));
  }

  if (
    !safeBookingId ||
    safeBookingId === "undefined" ||
    safeBookingId === "null"
  ) {
    console.error("Invalid bookingId:", bookingId);
    return Promise.reject(new Error("Invalid booking ID"));
  }

  return api
    .delete(`/rooms/${safeRoomId}/${safeBookingId}`)
    .then((res) => {
      console.log("API delete booking response:", res.data);
      return res.data;
    })
    .catch((err) => {
      console.error("API delete booking error:", err);
      // Provide more detailed error information
      if (err.response) {
        console.error("Error response:", err.response.data);
        // Specifically handle permission errors
        if (err.response.status === 403) {
          throw new Error(
            "Permission denied: Only admins or the person who created the booking can delete it"
          );
        }
        throw new Error(
          `Server error: ${err.response.status} - ${
            err.response.data.error || "Unknown error"
          }`
        );
      } else if (err.request) {
        throw new Error("Network error: No response received from server");
      } else {
        throw new Error(`Request error: ${err.message}`);
      }
    });
}

export function updateStateRoom(self, updatedRoom, loadMyBookings) {
  // Transform the updatedRoom to ensure it has the right format
  const transformedRoom = transformRoomData([updatedRoom])[0];

  self.setState(
    (previousState) => {
      // Find the relevant room in React State and replace it with the new room data
      const updatedRoomData = previousState.roomData.map((room) => {
        if (room._id === transformedRoom._id) {
          return transformedRoom;
        } else {
          return room;
        }
      });
      return {
        // Update the room data in application state
        roomData: updatedRoomData,
        currentRoom: transformedRoom,
      };
    },
    () => {
      // Call loadMyBookings as a callback after state is updated
      loadMyBookings();
    }
  );
}
