from django.urls import path
from . import views

urlpatterns = [
    path('donation-history/', views.donation_history_view, name='donation_history'),
    path('request-history/', views.request_history_view, name='request_history'),
]