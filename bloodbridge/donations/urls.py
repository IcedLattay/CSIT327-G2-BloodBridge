from django.urls import path
from . import views

urlpatterns = [
    path('donation-history/', views.donation_history_view, name='donation_history'),
    path('request-history/', views.request_history_view, name='request_history'),
    path('appointments/<int:request_id>/cancel/', views.cancel_appointment, name='cancel_appointment'),
    path('appointments/<int:request_id>/approve/', views.approve_appointment, name='approve_appointment'),
    path('update-emergency/<int:request_id>/', views.toggle_emergency, name="toggle-request-emergency"),
    path('hospital/submit-request/', views.hospital_submit_request, name='hospital-submit-request'),
]