from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class CustomUser(AbstractUser):
    is_available = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.username}"


class Profile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    first_name = models.CharField(max_length=15, blank=True, default='', null=True)
    last_name = models.CharField(max_length=10, blank=True, default='', null=True)
    full_name = models.CharField(max_length=25, blank=True, default='New_User', null=True)
    contact_number = models.CharField(max_length=15, blank=True, default='', null=True)
    blood_type = models.ForeignKey('donations.BloodType', on_delete=models.SET_NULL, null=True, blank=True)
    profile_picture = models.CharField(max_length=255, default='images/default-user-icon.jpg')

    def __str__(self):
        return (
            f"Profile of {self.full_name}:\n"
            f"Contact Number: {self.contact_number}\n"
            f"Email: {self.user.username}\n"
            f"Blood Type: {self.blood_type.type if self.blood_type else 'N/A'}"
        )
    

class Hospital(models.Model):
    name = models.CharField(max_length=255)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.name
    


class Request(models.Model):
    URGENCY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE)
    blood_type = models.ForeignKey('donations.BloodType', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    urgency = models.CharField(max_length=10)
    notes = models.TextField(blank=True, null=True)
    time_open = models.TimeField()
    time_close = models.TimeField()
    days_open = models.CharField(max_length=255)  # Could store as comma-separated, e.g. "Mon,Tue,Wed"

    def __str__(self):
        return f"{self.hospital.name} - {self.blood_type} ({self.urgency})"


class Appointment(models.Model):
    donor = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    request = models.ForeignKey(Request, on_delete=models.CASCADE)
    date = models.DateField()
    time_start = models.TimeField()
    time_end = models.TimeField()

    def __str__(self):
        return f"{self.donor.username} - {self.request.blood_type.type_name} on {self.date}"