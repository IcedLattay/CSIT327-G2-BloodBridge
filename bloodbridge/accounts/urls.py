from django.urls import path
from . import views

urlpatterns = [
    path("", views.index_view, name="index"),  # landing page (login/signup)
    path("register/", views.register_view, name="register"),
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("home/", views.home_view, name="home"),  # user homepage after login
    path("profile/", views.profile_view, name="profile"), 
    path('donation-history/', views.donation_history_view, name='donation_history'),
    path('request-history/', views.request_history_view, name='request_history'),
]
