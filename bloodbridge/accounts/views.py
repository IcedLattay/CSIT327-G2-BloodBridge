from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from .forms import CustomUserCreationForm as CustomCreation
from .forms import CustomAuthenticationForm as CustomAuthentication
from django.contrib.auth.decorators import login_required

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


# Home view
@login_required(login_url='/')
def home_view(request):
    return render(request, "dashboard.html")


# Profile view
@login_required(login_url='/')
def profile_view(request):
    return render(request, "profile.html")

# Donation view
def donation_history_view(request):
    return render(request, 'donation_history.html')

# Request view
def request_history_view(request):
    return render(request, 'request_history.html')
