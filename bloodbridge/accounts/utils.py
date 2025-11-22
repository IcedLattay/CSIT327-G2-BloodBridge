from .models import AdminLog

def create_admin_log(admin, action_type, description):
    """
    Create an AdminLog entry. `admin` should be request.user (or None).
    action_type must be one of: 'approved', 'deleted', 'declined'
    """
    AdminLog.objects.create(
        admin=admin,
        action_type=action_type,
        description=description
    )
