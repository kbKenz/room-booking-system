import os
import django
import json
import datetime

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'room_booking_api.settings')
django.setup()

from rooms.models import Room
from authentication.models import User

def seed_data():
    print("Seeding data...")
    
    # Create a test user if it doesn't exist
    if not User.objects.filter(email='test@example.com').exists():
        user = User.objects.create_user(
            email='test@example.com',
            password='password',
            first_name='Test',
            last_name='User'
        )
        print(f"Created test user: {user.email}")
    
    # Clear existing rooms if any
    Room.objects.all().delete()
    print("Cleared existing rooms")
    
    # Create the 56 rooms from the old API
    rooms_data = [
        {"name": "Room 1", "floor": "1", "capacity": 18, "assets": {"pcLab": True}},
        {"name": "Room 2", "floor": "1", "capacity": 18, "assets": {"projector": True}},
        {"name": "Room 3", "floor": "1", "capacity": 18, "assets": {"projector": True, "opWalls": True}},
        {"name": "Room 4", "floor": "1", "capacity": 24, "assets": {"macLab": False, "pcLab": False, "projector": False, "tv": False, "opWalls": False, "whiteBoard": False}},
        {"name": "Room 5", "floor": "1", "capacity": 18, "assets": {"opWalls": True}},
        {"name": "Room 1", "floor": "2", "capacity": 18, "assets": {"macLab": False, "pcLab": False, "projector": False, "tv": False, "opWalls": False, "whiteBoard": False}},
        {"name": "Room 2", "floor": "2", "capacity": 18, "assets": {"macLab": False, "pcLab": False, "projector": False, "tv": False, "opWalls": False, "whiteBoard": False}},
        {"name": "Room 3", "floor": "2", "capacity": 18, "assets": {"macLab": False, "pcLab": False, "projector": False, "tv": False, "opWalls": False, "whiteBoard": False}},
        {"name": "Room 4", "floor": "2", "capacity": 18, "assets": {"macLab": False, "pcLab": False, "projector": False, "tv": False, "opWalls": False, "whiteBoard": False}},
        {"name": "Room 5", "floor": "2", "capacity": 18, "assets": {"macLab": False, "pcLab": False, "projector": False, "tv": False, "opWalls": False, "whiteBoard": False}},
        {"name": "Room 1", "floor": "3", "capacity": 18, "assets": {"tv": True}},
        {"name": "Room 2", "floor": "3", "capacity": 18, "assets": {"macLab": False, "pcLab": False, "projector": False, "tv": False, "opWalls": False, "whiteBoard": False}},
        {"name": "Room 3", "floor": "3", "capacity": 18, "assets": {"tv": True}},
        {"name": "Room 4", "floor": "3", "capacity": 18, "assets": {"tv": True}},
        {"name": "Studio 1", "floor": "3", "capacity": 18, "assets": {"macLab": False, "pcLab": False, "projector": False, "tv": False, "opWalls": False, "whiteBoard": False}},
        {"name": "Studio 2", "floor": "3", "capacity": 18, "assets": {"macLab": False, "pcLab": False, "projector": False, "tv": False, "opWalls": False, "whiteBoard": False}},
        {"name": "Lab 1", "floor": "3", "capacity": 20, "assets": {"macLab": True}},
        {"name": "Room 1", "floor": "4", "capacity": 20, "assets": {"opWalls": True}},
        {"name": "Room 2", "floor": "4", "capacity": 20, "assets": {"opWalls": True}},
        {"name": "Room 3", "floor": "4", "capacity": 20, "assets": {"opWalls": True}},
        {"name": "Room 4", "floor": "4", "capacity": 20, "assets": {"projector": True, "opWalls": True}},
        {"name": "Room 5", "floor": "4", "capacity": 20, "assets": {"projector": True}},
        {"name": "Room 6", "floor": "4", "capacity": 20, "assets": {"projector": True}},
        {"name": "Room 7", "floor": "4", "capacity": 20, "assets": {"projector": True}},
        {"name": "Room 8", "floor": "4", "capacity": 40, "assets": {"projector": True}},
        {"name": "Room 9", "floor": "4", "capacity": 16, "assets": {"macLab": False, "pcLab": False, "projector": False, "tv": False, "opWalls": False, "whiteBoard": False}},
        {"name": "Room 10", "floor": "4", "capacity": 20, "assets": {"macLab": False, "pcLab": False, "projector": False, "tv": False, "opWalls": False, "whiteBoard": False}},
        {"name": "Room 11", "floor": "4", "capacity": 18, "assets": {"macLab": False, "pcLab": False, "projector": False, "tv": False, "opWalls": False, "whiteBoard": False}},
        {"name": "Room 12", "floor": "4", "capacity": 18, "assets": {"tv": True}},
        {"name": "Room 13", "floor": "4", "capacity": 18, "assets": {"macLab": False, "pcLab": False, "projector": False, "tv": False, "opWalls": False, "whiteBoard": False}},
        {"name": "Room 14", "floor": "4", "capacity": 18, "assets": {"tv": True}},
        {"name": "Room 15", "floor": "4", "capacity": 18, "assets": {"tv": True}},
        {"name": "Studio 11", "floor": "4", "capacity": 18, "assets": {"macLab": False, "pcLab": False, "projector": False, "tv": False, "opWalls": False, "whiteBoard": False}},
        {"name": "Studio 12", "floor": "4", "capacity": 18, "assets": {"macLab": False, "pcLab": False, "projector": False, "tv": False, "opWalls": False, "whiteBoard": False}},
        {"name": "Studio 13", "floor": "4", "capacity": 18, "assets": {"macLab": False, "pcLab": False, "projector": False, "tv": False, "opWalls": False, "whiteBoard": False}},
        {"name": "Studio 14", "floor": "4", "capacity": 18, "assets": {"macLab": False, "pcLab": False, "projector": False, "tv": False, "opWalls": False, "whiteBoard": False}},
        {"name": "Studio 15", "floor": "4", "capacity": 18, "assets": {"macLab": False, "pcLab": False, "projector": False, "tv": False, "opWalls": False, "whiteBoard": False}},
        {"name": "Lab 01", "floor": "4", "capacity": 20, "assets": {"macLab": True}},
        {"name": "Room 1", "floor": "13", "capacity": 20, "assets": {"opWalls": True}},
        {"name": "Room 2", "floor": "13", "capacity": 20, "assets": {"opWalls": True}},
        {"name": "Room 3", "floor": "13", "capacity": 20, "assets": {"opWalls": True}},
        {"name": "Room 4", "floor": "13", "capacity": 20, "assets": {"projector": True, "opWalls": True}},
        {"name": "Room 5", "floor": "13", "capacity": 20, "assets": {"projector": True}},
        {"name": "Room 6", "floor": "13", "capacity": 20, "assets": {"projector": True}},
        {"name": "Room 7", "floor": "13", "capacity": 20, "assets": {"projector": True}},
        {"name": "Room 8/9", "floor": "13", "capacity": 40, "assets": {"projector": True}},
        {"name": "Room 10", "floor": "13", "capacity": 16, "assets": {"macLab": False, "pcLab": False, "projector": False, "tv": False, "opWalls": False, "whiteBoard": False}},
        {"name": "Room 11", "floor": "13", "capacity": 20, "assets": {"macLab": False, "pcLab": False, "projector": False, "tv": False, "opWalls": False, "whiteBoard": False}},
        {"name": "Room 12", "floor": "13", "capacity": 20, "assets": {"macLab": False, "pcLab": False, "projector": False, "tv": False, "opWalls": False, "whiteBoard": False}},
        {"name": "Room 13", "floor": "13", "capacity": 20, "assets": {"macLab": True}},
        {"name": "Room 14", "floor": "13", "capacity": 20, "assets": {"pcLab": True}},
        {"name": "Room 15", "floor": "13", "capacity": 20, "assets": {"pcLab": True}},
        {"name": "Room 16", "floor": "13", "capacity": 20, "assets": {"pcLab": True}},
        {"name": "Room 17", "floor": "13", "capacity": 20, "assets": {"macLab": False, "pcLab": False, "projector": False, "tv": False, "opWalls": False, "whiteBoard": False}},
        {"name": "Room 18", "floor": "13", "capacity": 20, "assets": {"macLab": False, "pcLab": False, "projector": False, "tv": False, "opWalls": False, "whiteBoard": False}},
        {"name": "Green Screen Room", "floor": "13", "capacity": None, "assets": {"tv": True}}
    ]
    
    # Set created and updated timestamps to match the old API
    now = datetime.datetime.now()
    for room_data in rooms_data:
        room = Room(**room_data)
        room.created_at = now
        room.updated_at = now
        room.save()
        print(f"Created room: {room.name} (Floor {room.floor})")
    
    print("Seeding completed!")

if __name__ == "__main__":
    seed_data() 