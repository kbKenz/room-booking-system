FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create the entrypoint script directly in the container
RUN echo '#!/bin/bash\n\
    set -e\n\
    \n\
    # Always run migrations and seed data at container startup\n\
    echo "Initializing database..."\n\
    python manage.py makemigrations\n\
    python manage.py migrate\n\
    \n\
    # Check if data already exists (to avoid duplicate data)\n\
    if ! python -c "from authentication.models import User; exit(0) if User.objects.exists() else exit(1)" 2>/dev/null; then\n\
    echo "Seeding initial data..."\n\
    python seed_data.py\n\
    echo "Data seeding completed."\n\
    else\n\
    echo "Data already exists, skipping seed."\n\
    fi\n\
    \n\
    # Start the Django server\n\
    echo "Starting Django server..."\n\
    exec python manage.py runserver 0.0.0.0:8000' > /entrypoint.sh \
    && chmod +x /entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"] 