#!/bin/bash

set -e

# Always run migrations and seed data at container startup
echo "Initializing database..."
python manage.py makemigrations
python manage.py migrate

# Check if data already exists (to avoid duplicate data)
if ! python -c "from authentication.models import User; exit(0) if User.objects.exists() else exit(1)" 2>/dev/null; then
    echo "Seeding initial data..."
    python seed_data.py
    echo "Data seeding completed."
else
    echo "Data already exists, skipping seed."
fi

# Start the Django server
echo "Starting Django server..."
exec python manage.py runserver 0.0.0.0:8000 