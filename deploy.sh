#!/bin/bash

# Build and start containers
echo "Building and starting containers..."
docker-compose up -d --build

echo "Containers started successfully!"
echo "Frontend is available at: http://localhost"
echo "Django API is available at: http://localhost:8000"
echo "Django Admin Panel at: http://localhost:8000/admin/"

# Check container status
echo "Container status:"
docker-compose ps 