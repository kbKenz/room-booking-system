# Set environment variables for production
$env:DJANGO_SECRET_KEY="yxjn92k3hs7akdf8j4m9snvbcx72jd84la5s"
$env:DOMAIN="roombooking.example.com"
$env:API_URL="https://roombooking.example.com/api"

# Build and start containers with production configuration
Write-Host "Building and starting production containers..."
docker-compose -f docker-compose.prod.yml up -d --build

Write-Host "Production containers started successfully!"
Write-Host "Frontend is available at: https://$env:DOMAIN"
Write-Host "API is accessible at: $env:API_URL"
Write-Host "Django Admin Panel at: https://$env:DOMAIN/admin/"

# Check container status
Write-Host "Container status:"
docker-compose -f docker-compose.prod.yml ps 