from django.db import models
from django.conf import settings
from django.utils import timezone
import datetime
import pytz

class Room(models.Model):
    name = models.CharField(max_length=100)
    floor = models.CharField(max_length=20)
    capacity = models.IntegerField(null=True, blank=True)
    assets = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} (Floor {self.floor})"

    def save(self, *args, **kwargs):
        # Set default assets if not provided
        if not self.assets:
            self.assets = {
                "macLab": False,
                "pcLab": False,
                "projector": False,
                "tv": False,
                "opWalls": False,
                "whiteBoard": False
            }
        super().save(*args, **kwargs)

class Booking(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='bookings')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    bookingStart = models.DateTimeField()
    bookingEnd = models.DateTimeField()
    startHour = models.FloatField()
    duration = models.FloatField()
    purpose = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    recurring = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.room.name} - {self.purpose} ({self.bookingStart})"

    def save(self, *args, **kwargs):
        # Convert bookingStart and bookingEnd to Sydney timezone if they're not already
        sydney_tz = pytz.timezone('Australia/Sydney')
        
        # Check for booking conflicts before saving
        self.check_booking_conflicts()
        
        super().save(*args, **kwargs)

    def check_booking_conflicts(self):
        """Check if there are any booking conflicts."""
        if not self.room_id:
            return  # Skip validation if no room is assigned yet
            
        new_booking_start = self.bookingStart
        new_booking_end = self.bookingEnd
        
        # Find existing bookings for the same room
        conflicting_bookings = Booking.objects.filter(
            room=self.room,
            # Exclude self when updating
            **({"id__ne": self.id} if self.id else {})
        )
        
        for booking in conflicting_bookings:
            existing_start = booking.bookingStart
            existing_end = booking.bookingEnd
            
            # Check if there's overlap
            if ((new_booking_start >= existing_start and new_booking_start < existing_end) or
                (existing_start >= new_booking_start and existing_start < new_booking_end)):
                
                raise ValueError(
                    f"Booking could not be saved. There is a clash with an existing booking from "
                    f"{existing_start.strftime('%H:%M')} to {existing_end.strftime('%H:%M on %d %b %Y')}"
                )
