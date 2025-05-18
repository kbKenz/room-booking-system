from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import UserSerializer

# Create your views here.

class SignUpView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                if user:
                    token = RefreshToken.for_user(user)
                    return Response({
                        'token': str(token.access_token),
                    }, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({
                    'error': {
                        'message': str(e)
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Handle validation errors
        return Response({
            'error': {
                'message': 'A user with this email already exists' 
                if 'email' in serializer.errors else serializer.errors
            }
        }, status=status.HTTP_409_CONFLICT if 'email' in serializer.errors else status.HTTP_400_BAD_REQUEST)


class SignInView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        user = authenticate(email=email, password=password)
        
        if user:
            token = RefreshToken.for_user(user)
            return Response({
                'token': str(token.access_token),
            })
        
        return Response({
            'error': {
                'message': 'Invalid credentials'
            }
        }, status=status.HTTP_401_UNAUTHORIZED)
