# Room Booking System Deployment Script for Vercel and Heroku

# Step 1: Set environment variables
$env:REACT_APP_API_URL = "https://room-booking-api.herokuapp.com/api"

# Step 2: First deploy the Django backend to Heroku (you need to have Heroku CLI installed)
Write-Host "Deploying Django backend to Heroku..."
Write-Host "Make sure you have installed the Heroku CLI and logged in with 'heroku login'"
Write-Host "Creating Heroku app..."
# To create a new app (uncomment if needed):
# heroku create room-booking-api

Write-Host "Setting environment variables on Heroku..."
heroku config:set SECRET_KEY="your-secure-production-key" --app room-booking-api
heroku config:set DEBUG="False" --app room-booking-api
heroku config:set DJANGO_ALLOWED_HOSTS="room-booking-api.herokuapp.com,room-booking-system.vercel.app" --app room-booking-api

Write-Host "Pushing code to Heroku..."
git subtree push --prefix django_room_booking_api heroku main

# Step 3: Deploy React frontend to Vercel
Write-Host "`nDeploying React frontend to Vercel..."

# First, save the current directory
$currentDir = Get-Location

# Navigate to the web directory
Set-Location -Path ".\web"

# Deploy the React application to Vercel
Write-Host "Running Vercel deployment..."
vercel --prod

# Return to the original directory
Set-Location -Path $currentDir

Write-Host "`nDeployment completed!"
Write-Host "Backend API URL: https://room-booking-api.herokuapp.com"
Write-Host "Frontend URL: Check the Vercel deployment output for the assigned domain"
Write-Host "Don't forget to update the API URL in your Vercel environment variables if needed." 