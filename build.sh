#!/usr/bin/env bash
# exit on error
set -o errexit

cd django_room_booking_api

# Install dependencies
pip install -r ../requirements.txt

# Collect static files
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate 