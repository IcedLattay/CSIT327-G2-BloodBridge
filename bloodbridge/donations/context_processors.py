from django.utils import timezone
from datetime import timedelta
from .models import Notification  # import your model from the same app



# Get User's notifications
def notifications_processor(request):
    if not request.user.is_authenticated:
        return {}
    
    three_days_ago = timezone.now() - timedelta(days=3)

    notifications = Notification.objects.filter(
        user=request.user,
        has_action=False,              # Still actionable
        created_at__gte=three_days_ago # Not older than 3 days
    ).order_by('-created_at')

    unseen_count = Notification.objects.filter(
        user=request.user,
        is_seen=False,
        created_at__gte=three_days_ago
    ).count()

    return ({ 
        "notifications" : notifications,
        "initial_unseen_count" : unseen_count,     
    })