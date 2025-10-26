from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import Donation, Request


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



