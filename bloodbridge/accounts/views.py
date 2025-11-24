from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout, authenticate
from .forms import CustomUserCreationForm as CustomCreation
from .forms import CustomAuthenticationForm as CustomAuthentication
from .forms import HospitalCreationForm
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from accounts.models import CustomUser
from donations.models import BloodType, Donation, Request, Appointment
from django.contrib.auth.forms import AuthenticationForm
from django.contrib import messages
from django.views.decorators.http import require_POST
from .models import AdminLog, SupabaseHospital, HospitalBloodStock
from django.contrib.auth.decorators import user_passes_test
from django.http import JsonResponse
import json
from .utils import create_admin_log

# Index view
def index_view(request):

    if request.user.is_authenticated:  # di na siya kabalik sa /index url if logged in
        if request.user.role == 'hospital':

            return redirect('hospital-dashboard')
        elif request.user.role == 'user':

            return redirect('home')

    return render(request, "index.html")


# User Registration view
def register_view(request):
    if request.method == 'POST':
        form = CustomCreation(request.POST, request.FILES)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_active = False  # pending approval
            user.save()
            return JsonResponse({"status": "success","registration_state": "pending"})
        else:
            return JsonResponse({'status': 'error', 'errors': form.errors}, status=400)
    return redirect('index')

# Hospital Registration view
def register_hospital_view(request):
    if request.method == 'POST':
        form = HospitalCreationForm(request.POST, request.FILES)
        if form.is_valid():
            hospital = form.save(commit=True)  # already sets is_active=False, is_approved=False
            return JsonResponse({
                'status': 'success',
                'message': 'Your hospital registration is pending admin approval.'
            })
        else:
            return JsonResponse({'status': 'error', 'errors': form.errors}, status=400)
    return redirect('index')


# Login view
def login_view(request):
    if request.user.is_authenticated:  # di na siya kabalik sa /login url if logged in
        if request.user.role == 'user':
            return redirect('home')
        elif request.user.role == 'hospital':
            return redirect('hospital-dashboard')
        
    
    if request.method == "POST":
        form = CustomAuthentication(request, data=request.POST)  # bind submitted data
        
        if form.is_valid():
            user = form.get_user()
            login(request, user)  # log in user

            # ✅ Return JSON instead of redirect
            if user.role == 'user':
                return JsonResponse({'status': 'success', 'redirect_url': '/home/'})
            elif user.role == 'hospital':
                return JsonResponse({'status': 'success', 'redirect_url': '/hospital-dashboard/'})
        else:
            return JsonResponse({'status': 'error', 'errors': form.errors}, status=400)
    return redirect("index")


# Logout view
def logout_view(request):
    logout(request)
    return redirect("index")











# USER-ONLY VIEWS!!!

# User Dashboard / Home view
@login_required(login_url='/')
def home_view(request):

    user = request.user

    total_donations = Donation.objects.filter(donor=user).count()
    total_requests = Request.objects.filter(requester=user).count()
    total_pending = Request.objects.filter(requester=user, status="Pending").count()

    context = {
        "total_donations": total_donations,
        "total_requests": total_requests,
        "total_pending": total_pending,
    }

    return render(request, 'dashboard.html', context)


# Profile view
@login_required(login_url='/')
def profile_view(request):
    user = request.user
    
    blood_types = BloodType.objects.all()
    return render(request, "profile.html", {
        "user": user,
        "blood_types": blood_types,
    })


# Update Pfp view 
@login_required(login_url='/')
def update_pfp(request):
    if request.method == "POST":
        selected_pfp = request.POST.get("selected-pfp")

        # make sure something was selected
        if not selected_pfp:
            return JsonResponse({"success": False, "message": "No profile picture selected."})

        # assuming you have a field in your user model or related profile
        user = request.user
        profile = user.profile

        profile.profile_picture = selected_pfp   # or user.profile.profile_picture depending on your setup
        profile.save()

        return JsonResponse({"success": True, "message": "Profile picture updated!"})

    # if not a POST request
    return JsonResponse({"success": False, "message": "Invalid request."})


@login_required(login_url='/')
def update_profile_details(request):
    if request.method == "POST":
        selected_bt_id = request.POST.get("selected-blood-type")
        contact_number = request.POST.get("contact-number")
        first_name = request.POST.get("first-name")
        last_name = request.POST.get("last-name")

        # assuming you have a field in your user model or related profile
        user = request.user
        profile = user.profile

        profile.first_name = first_name
        profile.last_name = last_name
        profile.full_name = f"{first_name} {last_name}" 
        profile.contact_number = contact_number
        if selected_bt_id:
            try:
                blood_type = BloodType.objects.get(id=selected_bt_id)
                profile.blood_type = blood_type
            except BloodType.DoesNotExist:
                pass  # Optionally handle invalid ID

        profile.save()

        return JsonResponse({"success": True, "message": "Profile details updated!"})

    # if not a POST request
    return JsonResponse({"success": False, "message": "Invalid request."})












# HOSPITAL-ONLY VIEWS!!!

from datetime import date

# Hospital Dashboard view
@login_required(login_url='/')
def hospital_dashboard_view(request):
    user = request.user

    total_donations = Donation.objects.filter(hospital=user).count()
    total_requests = Request.objects.filter(hospital=user, status='pending').count()
    total_available_users = CustomUser.objects.filter(is_available=True).count()

    appointments = Appointment.objects.filter(
        request__requester=user,  # only appointments for requests directed to this hospital
        date__gte=date.today()           # only today or future appointments
    ).order_by('date', 'time_start')

    requests = Request.objects.filter(hospital=user, status="pending")

    blood_types = BloodType.objects.all()


    return render(request, 'hospital-dashboard.html', {
        "total_donations" : total_donations,
        "total_requests" : total_requests,
        "total_available_users" : total_available_users,
        "appointments" : appointments,
        "requests" : requests,
        "blood_types" : blood_types,
    })

# Hospital Manage Inventory view
@login_required(login_url='/')
def hospital_manage_inventory(request):
    user = request.user

    stocks = HospitalBloodStock.objects.filter(hospital = user)

    return render(request, 'hospital-manage-blood-inventory.html', {
        "stocks" : stocks,
    })

# Update Stocks view
@login_required(login_url='/')
def update_stocks(request):
    if request.method == "POST":
        data = request.POST

        stocks = HospitalBloodStock.objects.filter(hospital=request.user)

        for stock in stocks:
            field_name = f"stock_{stock.blood_type.id}"

            if field_name in data:
                new_units = data.get(field_name)

                try:
                    new_units = int(new_units)
                    if new_units < 0:
                        new_units = 0
                except:
                    continue

                stock.units_available = new_units
                stock.save()

        return JsonResponse({'success' : True})
    
    return redirect('hospital-update-stocks')












# ADMIN-ONLY VIEWS!!!

# Admin Login
def admin_login_view(request):
    """Admin login view"""
    error = None
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)

        if user is not None:
            if user.is_staff:  # check if admin
                login(request, user)
                return redirect('adminHospitalDashboard')
            else:
                error = "You are not an admin!"
        else:
            error = "Invalid credentials!"

    return render(request, 'admin/adminLogin.html', {'error': error})


@login_required
def admin_dashboard(request):
    """Admin dashboard view"""
    if not request.user.is_staff:
        return redirect('login')  # block non-admin access
    
    # Approved hospitals, latest first
    hospitals = CustomUser.objects.filter(role='hospital', is_active=True) \
        .select_related('profile') \
        .order_by('-date_joined')

    # Pending requests, latest first
    requests = CustomUser.objects.filter(role='hospital', is_active=False) \
        .select_related('profile') \
        .order_by('-date_joined')

    # Pass hospitals to template
    return render(request, 'admin/adminDashboard.html', {'hospitals': hospitals, 'requests': requests})



@login_required
@require_POST
def delete_hospital(request):
    if not request.user.is_staff:
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    try:
        data = json.loads(request.body)
        user_id = data.get('user_id')
    except:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    try:
        hospital = CustomUser.objects.get(id=user_id, role='hospital')
        email = hospital.username  # save before delete
        hospital.delete()

        # ⭐ LOG
        create_admin_log(
            request.user,
            "deleted",
            f"Deleted hospital account ({email})"
        )

        return JsonResponse({'success': True})

    except CustomUser.DoesNotExist:
        return JsonResponse({'error': 'Hospital not found'}, status=404)



@login_required
@require_POST
def approve_hospital(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "error": "Invalid JSON"}, status=400)

    user_id = data.get("user_id")
    if not user_id:
        return JsonResponse({"success": False, "error": "No user_id provided"}, status=400)

    try:
        user = CustomUser.objects.get(id=user_id)
    except CustomUser.DoesNotExist:
        return JsonResponse({"success": False, "error": "User not found"}, status=404)

    user.is_hospital_approved = True
    user.is_active = True
    user.save()

    # ⭐ CREATE LOG
    create_admin_log(
        request.user,
        "approved",
        f"Approved hospital account ({user.username})"
    )

    return JsonResponse({"success": True})



@login_required
@require_POST
def decline_hospital(request):
    try:
        data = json.loads(request.body)
        user_id = data.get("user_id")
    except:
        return JsonResponse({"success": False, "error": "Invalid JSON"}, status=400)

    try:
        user = CustomUser.objects.get(id=user_id)
        email = user.username
        user.delete()

        # ⭐ LOG
        create_admin_log(
            request.user,
            "declined",
            f"Declined hospital registration ({email})"
        )

        return JsonResponse({"success": True})
    except CustomUser.DoesNotExist:
        return JsonResponse({"success": False, "error": "User not found"}, status=404)



@login_required
def admin_userDashboard(request):
    # Approved users, latest first
    users = CustomUser.objects.filter(role='user', is_active=True).order_by('-date_joined')

    # Pending approval users, latest first
    pending_users = CustomUser.objects.filter(role='user', is_active=False).order_by('-date_joined')

    return render(request, 'admin/userDashboard.html', {
        'users': users,
        'pending_users': pending_users
    })
    

@login_required
@require_POST
def delete_user(request):
    if not request.user.is_staff:
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    user_id = request.POST.get('user_id')  # use POST instead of JSON
    if not user_id:
        return JsonResponse({'error': 'Missing user_id'}, status=400)

    try:
        user = CustomUser.objects.get(id=user_id)
        username_or_email = user.username or user.email  # save value before deletion
        user.delete()

        # ⭐ Create admin log
        log_message = f"Deleted user account ({username_or_email})" if username_or_email else "Deleted user account"
        create_admin_log(request.user, "deleted", log_message)

        return JsonResponse({'success': True})
    except CustomUser.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)



@login_required
@require_POST
def approve_user(request):
    if not request.user.is_staff:
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    try:
        data = json.loads(request.body)
        user_id = data.get('user_id')
        user = CustomUser.objects.get(id=user_id, role='user')

        user.is_active = True
        user.save()

        create_admin_log(
            request.user,
            "approved",
            f"Approved user account ({user.username})"
        )

        return JsonResponse({'success': True})
    except CustomUser.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)


@login_required
@require_POST
def decline_user(request):
    if not request.user.is_staff:
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    try:
        data = json.loads(request.body)
        user_id = data.get('user_id')
        user = CustomUser.objects.get(id=user_id, role='user')

        email = user.username
        user.delete()

        create_admin_log(
            request.user,
            "declined",
            f"Declined user registration ({email})"
        )

        return JsonResponse({'success': True})
    except CustomUser.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

    
def admin_logs_view(request):
    if not request.user.is_staff:
        return redirect('login')

    logs = AdminLog.objects.all()

    return render(request, 'admin/adminLogs.html', {
        "logs": logs
    })


