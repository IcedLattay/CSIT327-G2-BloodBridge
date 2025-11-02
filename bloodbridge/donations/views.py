from django.utils import timezone
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .models import Donation, Request
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from .forms import BloodRequestForm as RequestForm

# Create your views here.

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

    requests = Request.objects.filter(requester=request.user).order_by('-date')

    return render(request, 'request_history.html', {
        "requests": requests, 
    })


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


# Toggle Request Emergency view
@login_required
def toggle_emergency(request, request_id):
    if request.method == "POST":
        try:
            req = Request.objects.get(id=request_id)
            
            req.is_emergency = True
            req.save()

            return JsonResponse({"success": True})
        except Request.DoesNotExist:

            return JsonResponse({"success": False, "error": "Request not found"}, status=404)
        
    return JsonResponse({"success": False, "error": "Invalid method"}, status=400)


@login_required
def hospital_submit_request(request):
    if request.method == "POST":
        form = RequestForm(request.POST)


        if form.is_valid():

            # request_instance = Request(
            #     blood_type=blood_type,
            #     quantity=quantity,
            #     urgency=urgency,
            #     time_open=time_open,
            #     time_close=time_close,
            #     days_open=days_open,
            #     requester=request.user,
            #     date_requested=timezone.now()
            # )
            # request_instance.save()
            
            blood_type = form.cleaned_data['blood_type'] 
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

            # If there are m2m fields, save them after instance.save()
            # form.save_m2m()
            return JsonResponse({'success': True})
        
        return JsonResponse({'success': False, 'errors': form.errors}, status=400)

    return redirect('accounts:hospital-manage-requests')



