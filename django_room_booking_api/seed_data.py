import os
import django
import json
import datetime

# Set up Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "room_booking_api.settings")
django.setup()

from rooms.models import Room
from authentication.models import User


def seed_data():
    print("Seeding data...")

    # Create a test user if it doesn't exist
    if not User.objects.filter(email="test@example.com").exists():
        user = User.objects.create_user(
            email="test@example.com",
            password="password",
            first_name="Test",
            last_name="User",
        )
        print(f"Created test user: {user.email}")

    # Clear existing rooms if any
    Room.objects.all().delete()
    print("Cleared existing rooms")

    # Create the new room structure based on updated requirements
    rooms_data = [
        # Floor 1 (100s)
        {
            "name": "Room 105",
            "floor": "1",
            "capacity": 16,  # 8x2
            "assets": {
                "macLab": False,
                "pcLab": False,
                "projector": False,
                "tv": False,
                "opWalls": False,
                "whiteBoard": True,  # Interactive board
            },
        },
        {
            "name": "Room 103",
            "floor": "1",
            "capacity": 72,
            "assets": {
                "macLab": False,
                "pcLab": False,
                "projector": False,
                "tv": False,
                "opWalls": False,
                "whiteBoard": True,  # Interactive board
            },
        },
        {
            "name": "Room 104",
            "floor": "1",
            "capacity": 21,
            "assets": {
                "macLab": False,
                "pcLab": False,
                "projector": False,
                "tv": True,
                "opWalls": False,
                "whiteBoard": False,
            },
        },
        {
            "name": "Room 101",
            "floor": "1",
            "capacity": 8,  # Office - small capacity
            "assets": {
                "macLab": False,
                "pcLab": False,
                "projector": False,
                "tv": False,
                "opWalls": False,
                "whiteBoard": False,
            },
        },
        # Floor 2 (200s)
        {
            "name": "Room 201",
            "floor": "2",
            "capacity": 30,
            "assets": {
                "macLab": False,
                "pcLab": False,
                "projector": True,  # Projector/monitors
                "tv": False,
                "opWalls": False,
                "whiteBoard": False,
            },
        },
        {
            "name": "Room 202",
            "floor": "2",
            "capacity": 18,
            "assets": {
                "macLab": False,
                "pcLab": False,
                "projector": True,  # Monitors projector
                "tv": False,
                "opWalls": False,
                "whiteBoard": False,
            },
        },
        {
            "name": "Room 203",
            "floor": "2",
            "capacity": 18,
            "assets": {
                "macLab": False,
                "pcLab": False,
                "projector": True,  # Monitors (treating as projector capability)
                "tv": False,
                "opWalls": False,
                "whiteBoard": False,
            },
        },
        {
            "name": "Room 207",
            "floor": "2",
            "capacity": 17,
            "assets": {
                "macLab": False,
                "pcLab": False,
                "projector": False,
                "tv": True,  # TV/board
                "opWalls": False,
                "whiteBoard": True,  # Board
            },
        },
        {
            "name": "Room 206",
            "floor": "2",
            "capacity": 8,  # Office
            "assets": {
                "macLab": False,
                "pcLab": False,
                "projector": False,
                "tv": False,
                "opWalls": False,
                "whiteBoard": False,
            },
        },
        {
            "name": "Room 204",
            "floor": "2",
            "capacity": 18,
            "assets": {
                "macLab": False,
                "pcLab": False,
                "projector": False,
                "tv": False,
                "opWalls": False,
                "whiteBoard": True,  # Interactive board
            },
        },
        # Floor 3 (300s)
        {
            "name": "Room 302",
            "floor": "3",
            "capacity": 100,  # Hall - large capacity
            "assets": {
                "macLab": False,
                "pcLab": False,
                "projector": False,
                "tv": False,
                "opWalls": False,
                "whiteBoard": False,
            },
        },
        {
            "name": "Room 307",
            "floor": "3",
            "capacity": 8,  # Office
            "assets": {
                "macLab": False,
                "pcLab": False,
                "projector": False,
                "tv": False,
                "opWalls": False,
                "whiteBoard": False,
            },
        },
        {
            "name": "Room 308",
            "floor": "3",
            "capacity": 8,  # Office
            "assets": {
                "macLab": False,
                "pcLab": False,
                "projector": False,
                "tv": False,
                "opWalls": False,
                "whiteBoard": False,
            },
        },
        {
            "name": "Room 304",
            "floor": "3",
            "capacity": 8,  # Office
            "assets": {
                "macLab": False,
                "pcLab": False,
                "projector": False,
                "tv": False,
                "opWalls": False,
                "whiteBoard": False,
            },
        },
        {
            "name": "Room 305",
            "floor": "3",
            "capacity": 8,  # Office
            "assets": {
                "macLab": False,
                "pcLab": False,
                "projector": False,
                "tv": False,
                "opWalls": False,
                "whiteBoard": False,
            },
        },
        {
            "name": "Room 306",
            "floor": "3",
            "capacity": 8,  # Office
            "assets": {
                "macLab": False,
                "pcLab": False,
                "projector": False,
                "tv": False,
                "opWalls": False,
                "whiteBoard": False,
            },
        },
        # Floor 4 (400s) - All offices
        {
            "name": "Room 401",
            "floor": "4",
            "capacity": 8,  # Office
            "assets": {
                "macLab": False,
                "pcLab": False,
                "projector": False,
                "tv": False,
                "opWalls": False,
                "whiteBoard": False,
            },
        },
        {
            "name": "Room 402",
            "floor": "4",
            "capacity": 8,  # Office
            "assets": {
                "macLab": False,
                "pcLab": False,
                "projector": False,
                "tv": False,
                "opWalls": False,
                "whiteBoard": False,
            },
        },
        {
            "name": "Room 403",
            "floor": "4",
            "capacity": 8,  # Office
            "assets": {
                "macLab": False,
                "pcLab": False,
                "projector": False,
                "tv": False,
                "opWalls": False,
                "whiteBoard": False,
            },
        },
        {
            "name": "Room 405",
            "floor": "4",
            "capacity": 8,  # Office
            "assets": {
                "macLab": False,
                "pcLab": False,
                "projector": False,
                "tv": False,
                "opWalls": False,
                "whiteBoard": False,
            },
        },
        {
            "name": "Room 406",
            "floor": "4",
            "capacity": 8,  # Office
            "assets": {
                "macLab": False,
                "pcLab": False,
                "projector": False,
                "tv": False,
                "opWalls": False,
                "whiteBoard": False,
            },
        },
        {
            "name": "Room 407",
            "floor": "4",
            "capacity": 8,  # Office
            "assets": {
                "macLab": False,
                "pcLab": False,
                "projector": False,
                "tv": False,
                "opWalls": False,
                "whiteBoard": False,
            },
        },
        {
            "name": "Room 404",
            "floor": "4",
            "capacity": 8,  # Office
            "assets": {
                "macLab": False,
                "pcLab": False,
                "projector": False,
                "tv": False,
                "opWalls": False,
                "whiteBoard": False,
            },
        },
    ]

    # Create rooms
    for room_data in rooms_data:
        room = Room.objects.create(**room_data)
        print(f"Created room: {room.name} on floor {room.floor}")

    print(f"Seeded {len(rooms_data)} rooms successfully!")


if __name__ == "__main__":
    seed_data()
