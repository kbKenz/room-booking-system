# Room Booking API (Django)

A Django REST API for managing room bookings, including user authentication and recurring bookings.

## Setup and Installation

1. Install dependencies:

```
pip install -r requirements.txt
```

2. Apply migrations:

```
python manage.py makemigrations
python manage.py migrate
```

3. Seed initial data (optional):

```
python seed_data.py
```

4. Run the server:

```
python manage.py runserver
```

## Docker Setup

You can also run this application using Docker:

```
docker-compose up
```

The application will automatically:

1. Apply migrations (if needed)
2. Seed initial data (if needed)
3. Start the Django server on port 8000

### Docker Details

- The database (SQLite) is persisted in a volume
- Docker will automatically initialize the database on first run
- The server listens on 0.0.0.0:8000 inside the container
- Port 8000 is exposed to the host

## API Endpoints

### Authentication

- **POST /auth/sign-up** - Create a new user account

  - Request Body:
    ```json
    {
      "email": "user@example.com",
      "password": "password",
      "first_name": "John",
      "last_name": "Doe"
    }
    ```
  - Response:
    ```json
    {
      "token": "JWT_TOKEN_HERE"
    }
    ```

- **POST /auth** - Login to existing account
  - Request Body:
    ```json
    {
      "email": "user@example.com",
      "password": "password"
    }
    ```
  - Response:
    ```json
    {
      "token": "JWT_TOKEN_HERE"
    }
    ```

### Rooms and Bookings

- **GET /rooms** - Get all rooms with their bookings

  - Headers: `Authorization: Bearer JWT_TOKEN_HERE`
  - Response: List of all rooms with their bookings

- **POST /rooms** - Create a new room

  - Headers: `Authorization: Bearer JWT_TOKEN_HERE`
  - Request Body:
    ```json
    {
      "name": "Meeting Room 1",
      "floor": "1",
      "capacity": 10,
      "assets": {
        "macLab": false,
        "pcLab": false,
        "projector": true,
        "tv": true,
        "opWalls": false,
        "whiteBoard": true
      }
    }
    ```

- **PUT /rooms/:id** - Make a booking for a room

  - Headers: `Authorization: Bearer JWT_TOKEN_HERE`
  - Request Body for single booking:
    ```json
    {
      "bookingStart": "2023-12-01T09:00:00Z",
      "bookingEnd": "2023-12-01T10:00:00Z",
      "purpose": "Team Meeting",
      "description": "Weekly team sync",
      "recurring": []
    }
    ```
  - Request Body for recurring booking:
    ```json
    {
      "bookingStart": "2023-12-01T09:00:00Z",
      "bookingEnd": "2023-12-01T10:00:00Z",
      "purpose": "Team Meeting",
      "description": "Weekly team sync",
      "recurring": ["2023-12-31T10:00:00Z", "weekly"]
    }
    ```

- **DELETE /rooms/:id/:bookingId** - Delete a booking
  - Headers: `Authorization: Bearer JWT_TOKEN_HERE`

## Test User

If you've run the seed script, you can use:

- Email: test@example.com
- Password: password
