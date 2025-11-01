from django.db import models

class BloodType(models.Model):
    type = models.CharField(max_length=3, unique=True)  # e.g., "A+", "O-", etc.
    compatible_with = models.ManyToManyField("self", symmetrical=False, blank=True)

    def __str__(self):
        compatiblebTypes = ", ".join([bType.type for bType in self.compatible_with.all()])
        return f"{self.type} (compatible with: {compatiblebTypes if compatiblebTypes else 'None'})"


class Donation(models.Model):
    donor = models.ForeignKey('accounts.CustomUser', on_delete=models.CASCADE, related_name='donations_made')
    date = models.DateField()
    hospital = models.CharField(max_length=100, null=True)
    
    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.donor.username} donated to {self.hospital} on ({self.date})"
    

class Request(models.Model):
    URGENCY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    requester = models.ForeignKey('accounts.CustomUser', on_delete=models.CASCADE, blank=True, null=True, related_name="requests_made")
    blood_type = models.ForeignKey(BloodType, on_delete=models.CASCADE, related_name="requests_present_in")
    quantity = models.PositiveIntegerField(blank=True, null=True)
    urgency = models.CharField(max_length=10, null=True)
    date_requested = models.DateField(null=True)
    status = models.CharField(max_length=25, default='pending')

    # for hospitals to fill up

    time_open = models.TimeField(null=True)
    time_close = models.TimeField(null=True)
    days_open = models.CharField(max_length=255, blank=True, null=True)  # Could store as comma-separated, e.g. "Mon,Tue,Wed"

    # for users to fill up

    notes = models.TextField(blank=True, null=True)
    hospital = models.ForeignKey('accounts.CustomUser', on_delete=models.CASCADE, blank=True, null=True, related_name="requests_received")

    def __str__(self):
        requester = self.hospital.name if self.hospital else self.user.username
        return f"{requester} - {self.blood_type.type} ({self.urgency})"


class Appointment(models.Model):
    donor = models.ForeignKey('accounts.CustomUser', on_delete=models.CASCADE, related_name="appointments_made")
    request = models.ForeignKey(Request, on_delete=models.CASCADE, related_name="appointments_active")
    date = models.DateField(null=True)
    time_start = models.TimeField(null=True)
    time_end = models.TimeField(null=True)

    def __str__(self):
        return f"{self.donor.username} - {self.request.blood_type.type} on {self.date}"