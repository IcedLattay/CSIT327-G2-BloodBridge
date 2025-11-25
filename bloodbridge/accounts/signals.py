
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import CustomUser, Profile, HospitalBloodStock
from donations.models import BloodType

@receiver(post_save, sender=CustomUser)
def create_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=CustomUser)
def create_hospital_stock(sender, instance, created, **kwargs):
    if created and instance.role == "hospital":
        
        blood_types = BloodType.objects.all()
        for bt in blood_types:
            HospitalBloodStock.objects.get_or_create(
                hospital=instance,
                blood_type=bt,
                units_available=0
            )