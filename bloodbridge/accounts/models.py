from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('hospital', 'Hospital'),
    ]

    is_available = models.BooleanField(default=False)
    role = models.CharField(max_length=20, default='user')

    def __str__(self):
        return f"{self.username} is {self.role}"


class Profile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    hospital_name = models.CharField(max_length=255, blank=True, default='', null=True)
    first_name = models.CharField(max_length=15, blank=True, default='', null=True)
    last_name = models.CharField(max_length=10, blank=True, default='', null=True)
    full_name = models.CharField(max_length=25, blank=True, default='New_User', null=True)
    contact_number = models.CharField(max_length=15, blank=True, default='', null=True)
    blood_type = models.ForeignKey('donations.BloodType', on_delete=models.SET_NULL, null=True, blank=True, related_name="profiles_present_in")
    profile_picture = models.CharField(max_length=255, default='images/default-user-icon.jpg')

    def __str__(self):  
        if self.user.role == "hospital":
            return ( 
                f"Hospital Name: {self.hospital_name}" 
                f"Email: {self.user.username}"
            )
        else:
            # Regular users — check if a Profile exists to show full info
            return (
                f"Name: {self.full_name}"
                f"Email: {self.user.username}"
                f"Contact Number: {self.contact_number}"
                f"Blood Type: {self.blood_type.type}"
            )

    
