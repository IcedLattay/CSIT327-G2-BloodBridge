from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import Donation, Request
from django.http import JsonResponse
from django.views.decorators.http import require_POST

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
    return render(request, 'request_history.html', {"requests": requests})

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
