from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('hospital', 'Hospital'),
        ('admin', 'Admin'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='donor')

    def __str__(self):
        return f"{self.username} ({self.role})"


class Profile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=25, blank=True, default='New_User', null=True)
    contact_number = models.CharField(max_length=15, blank=True, default='None', null=True)
    blood_type = models.ForeignKey('donations.BloodType', on_delete=models.SET_NULL, null=True, blank=True)
    profile_picture = models.CharField(max_length=255, default='images/default-user-icon.jpg')

    def __str__(self):
        return (
            f"Profile of {self.full_name}:\n"
            f"Contact Number: {self.contact_number}\n"
            f"Email: {self.user.username}\n"
            f"Blood Type: {self.blood_type.type if self.blood_type else 'N/A'}"
        )