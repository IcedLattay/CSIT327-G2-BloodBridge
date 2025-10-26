from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from .forms import CustomUserCreationForm as CustomCreation
from .forms import CustomAuthenticationForm as CustomAuthentication
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from donations.models import BloodType, Donation, Request

# Index view
def index_view(request):
    login_form = CustomAuthentication()
    registration_form = CustomCreation()

    if request.user.is_authenticated:  # di na siya kabalik sa /index url if logged in
        return redirect("home")

    return render(request, "index.html", {
        "login_form": login_form,
        "registration_form": registration_form
    })


# Registration view
def register_view(request):
    if request.user.is_authenticated:  # di na siya kabalik sa /register url if logged in
        return redirect("home")
    
    if request.method == "POST":
        form = CustomCreation(request.POST)
        if form.is_valid():
            form.save()

            # ✅ Instead of redirecting to another page,
            # re-render index.html with a success message
            return render(request, "index.html", {
                "registration_success": True,  # flag to show success popup
            })
        else:
            login_form = CustomAuthentication()
            return render(request, "index.html", {
                "login_form": login_form,
                "registration_form": form,
                "open_modal": "register"
            })
    return redirect("index")


# Login view
def login_view(request):
    if request.user.is_authenticated:  # di na siya kabalik sa /login url if logged in
        return redirect("home")
    
    if request.method == "POST":
        form = CustomAuthentication(request, data=request.POST)  # bind submitted data
        if form.is_valid():
            user = form.get_user()
            login(request, user)  # log in user
            return redirect("home")  # go to home page
        else:
            registration_form = CustomCreation()
            return render(request, "index.html", {
                "login_form": form,
                "registration_form": registration_form,
                "open_modal": "login"
            })
    return redirect("index")


# Logout view
def logout_view(request):
    logout(request)
    return redirect("index")


# User Dashboard / Home view
@login_required(login_url='/')
def home_view(request):

    user = request.user

    total_donations = Donation.objects.filter(donor=user).count()
    total_requests = Request.objects.filter(requester=user).count()
    total_pending = Donation.objects.filter(donor=user, status="Pending").count() + Request.objects.filter(requester=user, status="Pending").count()

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

