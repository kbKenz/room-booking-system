# Build and start containers with local configuration
Write-Host "Building and starting local containers..."
docker-compose -f docker-compose.local.yml up -d --build

Write-Host "Local containers started successfully!"
Write-Host "Frontend & API are available at: http://localhost"
Write-Host "Django Admin Panel at: http://localhost/admin/"

# Check container status
Write-Host "Container status:"
docker-compose -f docker-compose.local.yml ps 