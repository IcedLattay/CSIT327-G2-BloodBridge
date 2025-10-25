from django.shortcuts import render
from django.contrib.auth.decorators import login_required

# Create your views here.

# Donation view
@login_required(login_url='/')
def donation_history_view(request):
    return render(request, 'donation_history.html')

# Request view
@login_required(login_url='/')
def request_history_view(request):
    return render(request, 'request_history.html')
