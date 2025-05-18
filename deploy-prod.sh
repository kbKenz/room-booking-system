#!/bin/bash

# Set environment variables for production
export DJANGO_SECRET_KEY="yxjn92k3hs7akdf8j4m9snvbcx72jd84la5s"
export DOMAIN="roombooking.example.com"
export API_URL="https://roombooking.example.com/api"

# Pull latest changes if using Git
# git pull origin main

# Build and start containers with production configuration
echo "Building and starting production containers..."
docker-compose -f docker-compose.prod.yml up -d --build

echo "Production containers started successfully!"
echo "Frontend is available at: https://$DOMAIN"
echo "API is accessible at: $API_URL"
echo "Django Admin Panel at: https://$DOMAIN/admin/"

# Check container status
echo "Container status:"
docker-compose -f docker-compose.prod.yml ps 