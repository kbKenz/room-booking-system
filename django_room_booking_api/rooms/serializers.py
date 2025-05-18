from rest_framework import serializers
from .models import Room, Booking
from django.contrib.auth import get_user_model

User = get_user_model()

class BookingSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Booking
        fields = (
            'id', 'room', 'user', 'user_email', 'bookingStart', 'bookingEnd', 
            'startHour', 'duration', 'purpose', 'description', 'recurring',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

class RoomSerializer(serializers.ModelSerializer):
    Bookings = BookingSerializer(many=True, read_only=True, source='bookings')
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    
    class Meta:
        model = Room
        fields = ('id', 'name', 'floor', 'capacity', 'assets', 'Bookings', 'createdAt', 'updatedAt')
        read_only_fields = ('id', 'createdAt', 'updatedAt') 