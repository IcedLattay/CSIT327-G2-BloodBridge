from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('regular', 'Regular'),
        ('hospital', 'Hospital'),
        ('admin', 'Admin'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='donor')

    def __str__(self):
        return f"{self.username} ({self.role})"