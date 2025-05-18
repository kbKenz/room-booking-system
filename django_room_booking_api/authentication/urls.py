from django.urls import path
from .views import SignUpView, SignInView

urlpatterns = [
    path('auth/sign-up', SignUpView.as_view(), name='sign-up'),
    path('auth', SignInView.as_view(), name='sign-in'),
] 