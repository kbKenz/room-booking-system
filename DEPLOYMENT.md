# Deployment Guide for Room Booking System

This guide explains how to deploy the Room Booking System, which consists of:

- A React frontend
- A Django backend

## Deployed Versions

The application is currently deployed at:

- Frontend: https://web-cnodfi14v-kenzs-projects-3fc0f5e8.vercel.app
- Backend API: https://room-booking-api-demo.onrender.com

## Frontend Deployment (Vercel)

1. **Prepare Configuration Files**:

   - vercel.json - Contains routing configuration
   - web/\_redirects - Contains redirect rules
   - web/copy-redirects.js - Script to copy redirect rules during build

2. **Deploy to Vercel**:

   ```bash
   # Navigate to the web directory
   cd web

   # Deploy to Vercel
   vercel --prod
   ```

3. **Set Environment Variables**:
   - REACT_APP_API_URL - Set to your backend API URL (e.g., https://room-booking-api-demo.onrender.com/api)

## Backend Deployment (Render)

1. **Prepare Configuration Files**:

   - django_room_booking_api/render.yaml - Contains Render service configuration
   - django_room_booking_api/requirements.txt - Updated with production dependencies
   - django_room_booking_api/Procfile - Contains process type definitions

2. **Update Django Settings**:

   - Update CORS settings to allow your frontend domain
   - Configure database for production

3. **Deploy to Render**:
   - Create a new service on Render
   - Connect to your GitHub repository
   - Select "Python" as the environment
   - Set the build command: `pip install -r requirements.txt`
   - Set the start command: `gunicorn room_booking_api.wsgi:application`
   - Set environment variables:
     - SECRET_KEY: [generate a secure key]
     - DEBUG: False
     - DJANGO_ALLOWED_HOSTS: .onrender.com,your-frontend-domain.vercel.app

## Testing Deployment

After deployment, verify that:

1. The frontend loads correctly
2. API requests work properly
3. User authentication functions as expected
4. Room booking functionality works

## Troubleshooting

If you encounter issues:

1. Check CORS settings in Django
2. Verify environment variables are set correctly
3. Check network requests in browser developer tools
4. Review deployment logs in Vercel and Render dashboards
