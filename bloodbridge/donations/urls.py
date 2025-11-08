from django.urls import path
from . import views

urlpatterns = [
    path('donation-history/', views.donation_history_view, name='donation_history'),
    path('request-history/', views.request_history_view, name='request_history'),
    path('donate-blood/', views.donate_blood_view, name='donate-blood'),
    path('appointments/available-dates/<int:request_id>/', views.get_available_dates, name='get-available-dates'),
    path('appointments/booked-slots/<int:request_id>/', views.get_booked_slots, name='get-booked-slots'),
    path('set-appointment/', views.set_appointment, name='set-appointment'),
    path('appointments/<int:request_id>/cancel/', views.cancel_appointment, name='cancel_appointment'),
    path('appointments/<int:request_id>/approve/', views.approve_appointment, name='approve_appointment'),
    path('update-emergency/<int:request_id>/', views.toggle_emergency, name="toggle-request-emergency"),
    path("hospital/requests/", views.hospital_manage_requests_view, name="hospital-manage-requests"),
    path('hospital/submit-request/', views.hospital_submit_request, name='hospital-submit-request'),
    path("hospital/donations/", views.hospital_record_donations_view, name="hospital-record-donations"),
    path("search-users/", views.search_users, name="search-users"),
    path("hospital/create-donation-record/", views.create_donation_record, name="create-donation-record"),
]