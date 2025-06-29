#!/bin/bash

# Function to handle script termination
cleanup() {
    echo "Stopping all services..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Set up trap for cleanup on script termination
trap cleanup SIGINT SIGTERM

# Start Django backend
echo "Starting Django backend..."
cd django_room_booking_api
python manage.py runserver &
DJANGO_PID=$!

# Start React frontend
echo "Starting React frontend..."
cd ../web
npm start &
REACT_PID=$!

# Wait for both processes
wait $DJANGO_PID $REACT_PID 