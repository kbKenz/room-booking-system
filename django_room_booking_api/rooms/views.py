from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Room, Booking
from .serializers import RoomSerializer, BookingSerializer
import datetime
import pytz
from django.utils import timezone

# Create your views here.

class RoomListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        rooms = Room.objects.all()
        serializer = RoomSerializer(rooms, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = RoomSerializer(data=request.data)
        if serializer.is_valid():
            room = serializer.save()
            return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)
        return Response({
            'error': {
                'message': serializer.errors
            }
        }, status=status.HTTP_400_BAD_REQUEST)

class BookingView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request, room_id):
        # Get the room or return 404
        room = get_object_or_404(Room, id=room_id)
        
        # Calculate start hour and duration
        sydney_tz = pytz.timezone('Australia/Sydney')
        booking_start = datetime.datetime.fromisoformat(request.data.get('bookingStart').replace('Z', '+00:00'))
        booking_end = datetime.datetime.fromisoformat(request.data.get('bookingEnd').replace('Z', '+00:00'))
        
        # Convert to Sydney timezone for calculating the start hour
        booking_start_sydney = booking_start.astimezone(sydney_tz)
        
        # Calculate start hour as a decimal (e.g., 13.5 for 1:30 PM)
        start_hour = booking_start_sydney.hour + booking_start_sydney.minute / 60
        
        # Calculate duration in hours
        duration = (booking_end - booking_start).total_seconds() / 3600
        
        # If recurring is empty, create a single booking
        if not request.data.get('recurring') or len(request.data.get('recurring')) == 0:
            booking_data = {
                'room': room.id,
                'user': request.user.id,
                'bookingStart': booking_start,
                'bookingEnd': booking_end,
                'startHour': start_hour,
                'duration': duration,
                'purpose': request.data.get('purpose'),
                'description': request.data.get('description', ''),
                'recurring': request.data.get('recurring', [])
            }
            
            serializer = BookingSerializer(data=booking_data)
            if serializer.is_valid():
                try:
                    serializer.save()
                    return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)
                except ValueError as e:
                    return Response({
                        'error': {
                            'message': str(e)
                        }
                    }, status=status.HTTP_400_BAD_REQUEST)
            return Response({
                'error': {
                    'message': serializer.errors
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Handle recurring bookings
            recurring_bookings = []
            
            # First booking data
            first_booking_data = {
                'room': room.id,
                'user': request.user.id,
                'bookingStart': booking_start,
                'bookingEnd': booking_end,
                'startHour': start_hour,
                'duration': duration,
                'purpose': request.data.get('purpose'),
                'description': request.data.get('description', ''),
                'recurring': request.data.get('recurring', [])
            }
            
            recurring_bookings.append(first_booking_data)
            
            # Settings for recurring bookings
            recurring_end_date = datetime.datetime.fromisoformat(request.data.get('recurring')[0].replace('Z', '+00:00'))
            recurring_type = request.data.get('recurring')[1]  # 'daily', 'weekly', or 'monthly'
            
            # Track the current booking date
            current_booking_date = booking_start
            
            # Calculate the delta based on recurring type
            if recurring_type == 'daily':
                delta = datetime.timedelta(days=1)
                max_bookings = (recurring_end_date - booking_start).days
            elif recurring_type == 'weekly':
                delta = datetime.timedelta(weeks=1)
                max_bookings = (recurring_end_date - booking_start).days // 7
            else:  # monthly
                max_bookings = ((recurring_end_date.year - booking_start.year) * 12 + 
                              recurring_end_date.month - booking_start.month)
            
            # Create bookings for each date in the recurring schedule
            for _ in range(max_bookings):
                if recurring_type == 'monthly':
                    # For monthly, we need to add months manually
                    month = current_booking_date.month + 1
                    year = current_booking_date.year + (month // 13)
                    month = month % 12 or 12  # Convert month 0 to 12
                    
                    next_booking_start = current_booking_date.replace(year=year, month=month)
                    next_booking_end = booking_end + (next_booking_start - booking_start)
                else:
                    next_booking_start = current_booking_date + delta
                    next_booking_end = booking_end + delta
                
                # Skip Sundays
                if next_booking_start.weekday() == 6:  # Sunday is 6
                    current_booking_date = next_booking_start
                    continue
                    
                booking_data = {
                    'room': room.id,
                    'user': request.user.id,
                    'bookingStart': next_booking_start,
                    'bookingEnd': next_booking_end,
                    'startHour': start_hour,
                    'duration': duration,
                    'purpose': request.data.get('purpose'),
                    'description': request.data.get('description', ''),
                    'recurring': request.data.get('recurring', [])
                }
                
                recurring_bookings.append(booking_data)
                current_booking_date = next_booking_start
            
            # Create all the bookings
            try:
                for booking_data in recurring_bookings:
                    serializer = BookingSerializer(data=booking_data)
                    if serializer.is_valid():
                        serializer.save()
                    else:
                        # If any booking is invalid, return an error
                        return Response({
                            'error': {
                                'message': serializer.errors
                            }
                        }, status=status.HTTP_400_BAD_REQUEST)
                
                return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)
            except ValueError as e:
                return Response({
                    'error': {
                        'message': str(e)
                    }
                }, status=status.HTTP_400_BAD_REQUEST)

class BookingDeleteView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, room_id, booking_id):
        # Get the room or return 404
        room = get_object_or_404(Room, id=room_id)
        
        # Get the booking or return 404
        booking = get_object_or_404(Booking, id=booking_id, room=room)
        
        # Delete the booking
        booking.delete()
        
        # Return the updated room data
        return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
