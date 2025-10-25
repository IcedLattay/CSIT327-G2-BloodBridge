from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("accounts.urls")),  # ✅ this connects your app routes
    path("", include("donations.urls")),
]
