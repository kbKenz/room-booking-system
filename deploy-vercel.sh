#!/bin/bash

# Room Booking System Deployment Script for Vercel and Heroku

# Step 1: Set environment variables
export REACT_APP_API_URL="https://room-booking-api.herokuapp.com/api"

# Step 2: First deploy the Django backend to Heroku (you need to have Heroku CLI installed)
echo "Deploying Django backend to Heroku..."
echo "Make sure you have installed the Heroku CLI and logged in with 'heroku login'"
echo "Creating Heroku app..."
# To create a new app (uncomment if needed):
# heroku create room-booking-api

echo "Setting environment variables on Heroku..."
heroku config:set SECRET_KEY="your-secure-production-key" --app room-booking-api
heroku config:set DEBUG="False" --app room-booking-api
heroku config:set DJANGO_ALLOWED_HOSTS="room-booking-api.herokuapp.com,room-booking-system.vercel.app" --app room-booking-api

echo "Pushing code to Heroku..."
git subtree push --prefix django_room_booking_api heroku main

# Step 3: Deploy React frontend to Vercel
echo -e "\nDeploying React frontend to Vercel..."

# Save the current directory
CURRENT_DIR=$(pwd)

# Navigate to the web directory
cd ./web

# Deploy the React application to Vercel
echo "Running Vercel deployment..."
npx vercel --prod

# Return to the original directory
cd $CURRENT_DIR

echo -e "\nDeployment completed!"
echo "Backend API URL: https://room-booking-api.herokuapp.com"
echo "Frontend URL: Check the Vercel deployment output for the assigned domain"
echo "Don't forget to update the API URL in your Vercel environment variables if needed." 