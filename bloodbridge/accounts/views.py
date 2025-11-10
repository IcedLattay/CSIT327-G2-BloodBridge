from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from .forms import CustomUserCreationForm as CustomCreation
from .forms import CustomAuthenticationForm as CustomAuthentication
from .forms import HospitalCreationForm as HospitalCreation
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from accounts.models import CustomUser
from donations.models import BloodType, Donation, Request, Appointment
from django.contrib.auth.forms import AuthenticationForm
from django.contrib import messages

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
            form.save()
            return JsonResponse({'status': 'success'})
        else:
            # Return errors as JSON
            return JsonResponse({
                'status': 'error', 'errors': form.errors}, status=400)
    return redirect('index')


# Hospital Registration view
def register_hospital_view(request):
    if request.method == 'POST':
        form = HospitalCreation(request.POST, request.FILES)

        if form.is_valid():
            form.save()
            return JsonResponse({'status': 'success'})
        else:
            return JsonResponse({'status': 'error','errors': form.errors,}, status=400)
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
        request__hospital=request.user,  # only appointments for requests directed to this hospital
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
                return redirect('admin-dashboard')
            else:
                error = "You are not an admin!"
        else:
            error = "Invalid credentials!"

    return render(request, 'adminLogin.html', {'error': error})



@login_required
def admin_dashboard(request):
    """Admin dashboard view"""
    if not request.user.is_staff:
        return redirect('login')  # block non-admin access
    return render(request, 'adminDashboard.html')


