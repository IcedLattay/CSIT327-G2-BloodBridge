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
    path('admin-dashboard/', views.admin_dashboard, name='adminHospitalDashboard'),
    path('delete-hospital/', views.delete_hospital, name='delete_hospital'),
    path('approve-hospital/', views.approve_hospital, name='approve_hospital'),
    path('decline-hospital/', views.decline_hospital, name='decline_hospital'),
    path('user-dashboard/', views.admin_userDashboard, name='adminUserDashboard'),
    path('delete-user/', views.delete_user, name='delete_user'),
    path('approve-user/', views.approve_user, name='approve_user'),
    path('decline-user/', views.decline_user, name='decline_user'),
    path('admin-logs/', views.admin_logs_view, name='adminLogs'),
    path("hospital/manage-blood-inventory/", views.hospital_manage_inventory, name="hospital-manage-blood-inventory"),
    path("hospital/update-stocks/", views.update_stocks, name="hospital-update-stocks"),
]