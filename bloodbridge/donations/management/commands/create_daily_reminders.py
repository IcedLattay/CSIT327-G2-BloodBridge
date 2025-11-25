from django.core.management.base import BaseCommand
from datetime import date, timedelta
from django.utils import timezone
from donations.models import Appointment, Notification

class Command(BaseCommand):
    help = 'Create daily appointment reminder notifications'

    def handle(self, *args, **options):
        today = date.today()
        
        upcoming_appointments = Appointment.objects.filter(date__gte=today)
        
        for appt in upcoming_appointments:
            if not Notification.objects.filter(
                type='appointment reminder',
                appointment=appt,
                created_at__date=today
            ).exists():
                Notification.objects.create(
                    user=appt.donor,
                    type='appointment reminder',
                    appointment=appt
                )
        
        # delete old reminders (reminder > 3)
        three_days_ago = timezone.now() - timedelta(days=3)
        Notification.objects.filter(
            type='appointment reminder',
            created_at__lt=three_days_ago
        ).delete()
        
        self.stdout.write(self.style.SUCCESS('Daily reminders created successfully'))
