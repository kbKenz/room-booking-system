from django.urls import path
from .views import RoomListView, BookingView, BookingDeleteView

urlpatterns = [
    path('rooms', RoomListView.as_view(), name='rooms'),
    path('rooms/<int:room_id>', BookingView.as_view(), name='room-booking'),
    path('rooms/<int:room_id>/<int:booking_id>', BookingDeleteView.as_view(), name='booking-delete'),
] 