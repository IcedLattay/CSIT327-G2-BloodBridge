from django.db import models
from accounts.models import CustomUser

class BloodType(models.Model):
    type = models.CharField(max_length=3, unique=True)  # e.g., "A+", "O-", etc.
    compatible_with = models.ManyToManyField("self", symmetrical=False, blank=True)

    def __str__(self):
        compatiblebTypes = ", ".join([bType.type for bType in self.compatible_with.all()])
        return f"{self.type} (compatible with: {compatiblebTypes if compatiblebTypes else 'None'})"


class Donation(models.Model):
    donor = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='donations')
    date = models.DateField()
    hospital = models.CharField(max_length=255)
    status = models.CharField(max_length=20)
    
    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.donor.username} donated to {self.hospital} on ({self.date})"