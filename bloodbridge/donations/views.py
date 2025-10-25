from django.shortcuts import render

# Create your views here.

# Donation view
def donation_history_view(request):
    return render(request, 'donation_history.html')

# Request view
def request_history_view(request):
    return render(request, 'request_history.html')
