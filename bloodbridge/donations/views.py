
from django.utils import timezone
from datetime import date, timedelta
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .models import Donation, Request, BloodType, Appointment, Notification
from accounts.models import Profile, CustomUser
from django.http import JsonResponse
from django.db import transaction
from django.views.decorators.http import require_POST
from .forms import BloodRequestForm as RequestForm, DonationForm, UserBloodRequestForm as UserRequestForm
from .forms import AppointmentForm

# FOR USERS END

# Donation_history view
@login_required(login_url='/')
def donation_history_view(request):
    
    donations = Donation.objects.filter(donor=request.user).order_by('-date')

    return render(request, 'donation_history.html', {
        "donations": donations,
    })


# Request_history view
@login_required(login_url='/')
def request_history_view(request):

    requests = Request.objects.filter(requester=request.user).order_by('-date_requested')

    return render(request, 'request_history.html', {
        "requests": requests, 
    })


# Donate blood view
@login_required(login_url='/')
def donate_blood_view(request):

    req = Request.objects.filter(
        blood_type__compatible_with=request.user.profile.blood_type,
        status='pending',
        requester__role='hospital'
        ).exclude(appointments_active__donor=request.user)

    return render (request, 'donate-blood.html', {
        "hospital_requests" : req,
    })

# Get Available Dates view
@login_required(login_url='/')
def get_available_dates(request, request_id):
    
    req = Request.objects.get(id=request_id)

    urgency = req.urgency
    days_open = req.days_open or ""
    
    urgency_ranges = {
        "high": 2,
        "medium": 3,
        "low": 7
    }

    target_count = urgency_ranges.get(urgency, 7)

    open_days = [d.strip() for d in days_open.split(",") if d.strip()]

    current_date = date.today() + timedelta(days=1)
    available_dates = []

    while len(available_dates) < target_count:
        if current_date.strftime("%A") in open_days:
            available_dates.append(current_date)
        current_date += timedelta(days=1)  # move to next day

    return JsonResponse({
        "available_dates": [d.strftime("%Y-%m-%d") for d in available_dates]
    })

# Get Booked Slots view
@login_required(login_url='/')
def get_booked_slots(request, request_id):
    
    date = request.GET.get('date')
    request_associated = Request.objects.get(id=request_id) 

    appointments = Appointment.objects.filter(request=request_associated, date=date)

    # Return a list of booked start times
    booked = [appt.time_start.strftime("%H:%M") for appt in appointments]

    return JsonResponse(booked, safe=False)

# Set Appointment view
@login_required(login_url='/')
def set_appointment(request):

    if request.method == "POST":
        form = AppointmentForm(request.POST)
        notif_id = request.GET.get("notif_id")

        if form.is_valid():
            with transaction.atomic():
                if notif_id:
                    try:
                        notif = Notification.objects.get(id=notif_id, user=request.user)
                        notif.has_action = True
                        notif.save()
                    except Notification.DoesNotExist:
                        pass

                donor = request.user
                req = Request.objects.get(id=form.cleaned_data['request'])
                date = form.cleaned_data['date']
                time_start = form.cleaned_data['time_start']
                time_end = form.cleaned_data['time_end']

                appointment_instance = Appointment(
                    donor=donor,
                    request=req,
                    date=date,
                    time_start=time_start,
                    time_end=time_end,
                )

                req.current_quantity += 1

                if req.current_quantity == req.quantity:
                    req.status = 'completed'

                

                req.save()
                appointment_instance.save()

            return JsonResponse({'success' : True})
        
        return JsonResponse({'success' : False, 'errors' : form.errors}, status=400)
    
    return redirect('donate-blood')

# Donate blood view
@login_required(login_url='/')
def request_blood_view(request):

    blood_types = BloodType.objects.all()
    hospitals = CustomUser.objects.filter(role='hospital')

    return render (request, 'request-blood.html', {
        "blood_types" : blood_types,
        "hospitals" : hospitals,
    })

# User Submit Request view 
@login_required(login_url='/')
def submit_request(request):
    if request.method == "POST":
        
        form = UserRequestForm(request.POST)

        if form.is_valid():
            blood_type = BloodType.objects.get(id=form.cleaned_data['blood_type'])
            hospital = CustomUser.objects.get(id=form.cleaned_data['hospital'])
            quantity = form.cleaned_data['quantity']
            urgency = form.cleaned_data['urgency']
            notes = form.cleaned_data['notes']

            request_instance = Request(
                requester = request.user,
                hospital = hospital,
                blood_type = blood_type,
                quantity = quantity,
                urgency = urgency,
                notes = notes,
                date_requested=timezone.now()
            )

            request_instance.save()

            return JsonResponse({'success': True})
        
        return JsonResponse({'success': False, 'errors': form.errors}, status=400)

    return redirect('request_blood')


# Get active notifications
@login_required(login_url='/')
def get_active_notifications(request):
    three_days_ago = timezone.now() - timedelta(days=3)

    notifications = Notification.objects.filter(
        user=request.user,
        has_action=False,
        created_at__gte=three_days_ago
    ).order_by('-created_at')

    data = [
        {
            "id": n.id,
            "request": {
                "id": n.request.id,
                "requester": {
                    "profile": {
                        "hospital_name": n.request.requester.profile.hospital_name
                    }
                },
                "quantity": n.request.quantity  
            },
            "created_at": n.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "is_read": n.is_read,
            "is_seen": n.is_seen,
        }
        for n in notifications
    ]

    return JsonResponse({'notifications': data})


# Count unseen notifications
@login_required(login_url='/')
def get_unseen_notifications_count(request):

    three_days_ago = timezone.now() - timedelta(days=3)
    unseen_count = Notification.objects.filter(
        user=request.user,
        is_seen=False,
        created_at__gte=three_days_ago
    ).count()

    return JsonResponse({'unseen_count': unseen_count})


# Set unseen notifications to seen
@login_required(login_url='/')
def set_unseen_to_seen(request):


    three_days_ago = timezone.now() - timedelta(days=3)

    Notification.objects.filter(
        user=request.user,
        is_seen=False,
        created_at__gte=three_days_ago
    ).update(is_seen=True)


    return JsonResponse({'success': True})


# Mark notifications as read
@login_required(login_url='/')
def mark_read(request, notif_id):

    notif = Notification.objects.get(id=notif_id)

    notif.is_read = True

    notif.save()

    return JsonResponse({"success" : True})






















# FOR HOSPITALS END

@require_POST
def cancel_appointment(request, request_id):
    req = Request.objects.get(id=request_id)
    req.status = "cancelled"
    req.save()
    return JsonResponse({"success": True})

@require_POST
def approve_appointment(request, request_id):
    req = Request.objects.get(id=request_id)
    req.status = "confirmed"
    req.save()
    return JsonResponse({"success": True})

# Hospital Manage Requests view
@login_required(login_url='/')
def hospital_manage_requests_view(request):
    user = request.user
    blood_types = BloodType.objects.all()

    requests_made = user.requests_made.all()

    return render(request, "hospital-manage-requests.html", {
        "requests_made" : requests_made,
        "blood_types" : blood_types,
    })

# Toggle Request Emergency view
@login_required
def toggle_emergency(request, request_id):
    if request.method == "POST":
        try:
            req = Request.objects.get(id=request_id)
            
            req.is_emergency = True
            req.save()


            users_to_notify = CustomUser.objects.filter(
                profile__blood_type=req.blood_type,
                is_active=True,
                role='user'
            )

            notifications = [
                Notification(
                    user=user,
                    request=req,
                    created_at=timezone.now(),
                ) 
                for user in users_to_notify
            ]

            Notification.objects.bulk_create(notifications, ignore_conflicts=True)

            return JsonResponse({"success": True})
        except Request.DoesNotExist:

            return JsonResponse({"success": False, "error": "Request not found"}, status=404)
        
    return JsonResponse({"success": False, "error": "Invalid method"}, status=400)


@login_required
def hospital_submit_request(request):
    if request.method == "POST":
        form = RequestForm(request.POST)


        if form.is_valid():
            
            blood_type = BloodType.objects.get(id=form.cleaned_data['blood_type'])
            quantity = form.cleaned_data['quantity']
            urgency = form.cleaned_data['urgency']
            time_open = form.cleaned_data['time_open']
            time_close = form.cleaned_data['time_close']
            days_open = form.cleaned_data['days_open']
            
            request_instance = Request(
                blood_type=blood_type,
                quantity=quantity,
                urgency=urgency,
                time_open=time_open,
                time_close=time_close,
                days_open=days_open,
                requester=request.user,
                date_requested=timezone.now()  # Set the date here
            )
            
            request_instance.save()

            return JsonResponse({'success': True})
        
        return JsonResponse({'success': False, 'errors': form.errors}, status=400)

    return redirect('hospital-manage-requests')



# Hospital Record Donations view
@login_required(login_url='/')
def hospital_record_donations_view(request):

    user = request.user
    blood_types = BloodType.objects.all()
    donations_received = user.donations_received.all()

    return render(request, "hospital-record-donation.html", {
        "blood_types" : blood_types,
        "donations_received" : donations_received,
    })


# Search for users view
@login_required
def search_users(request):
    query = request.GET.get('q', '').strip()

    if query:
        profiles = Profile.objects.filter(full_name__icontains=query)[:10]
    else:
        profiles = Profile.objects.all()[:10]

    data = [
        {
            "id": p.user.id,
            "name": p.full_name,
            "image": p.profile_picture,
        }
        for p in profiles
    ]

    return JsonResponse({"users": data})



@login_required
def create_donation_record(request):
    if request.method == "POST":
        form = DonationForm(request.POST)

        if form.is_valid():
            donor = CustomUser.objects.get(id=form.cleaned_data['donor'])
            blood_type = BloodType.objects.get(id=form.cleaned_data['blood_type'])
            date = form.cleaned_data['date']
            notes = form.cleaned_data['notes']

            donation_instance = Donation(
                donor=donor,
                date=date,
                hospital=request.user,
                blood_type=blood_type,
                notes=notes
            )

            donation_instance.save()

            return JsonResponse({'success' : True})
        
        return JsonResponse({'success' : False, 'errors' : form.errors}, status=400)
    
    return redirect('create-donation-record')
