from django.urls import path
from . import views

urlpatterns = [
    path("", views.index_view, name="index"),  # landing page (login/signup)
    path("register/", views.register_view, name="register"),
    path("register/hospital/", views.register_hospital_view, name="register-hospital"),
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("home/", views.home_view, name="home"),  # user homepage after login
    path("profile/", views.profile_view, name="profile"),
    path("update-pfp/", views.update_pfp, name="update-pfp"),
    path("update-profile-details/", views.update_profile_details, name="update-profile-details"),
    path("hospital-dashboard/", views.hospital_dashboard_view, name="hospital-dashboard"),
    path('admin-login/', views.admin_login_view, name='admin_login'),
    path('admin-dashboard/', views.admin_dashboard, name='admin-dashboard'),
    path('delete-hospital/', views.delete_hospital, name='delete_hospital'),
    path('approve-hospital/', views.approve_hospital, name='approve_hospital'),
    path('decline-hospital/', views.decline_hospital, name='decline_hospital'),
]