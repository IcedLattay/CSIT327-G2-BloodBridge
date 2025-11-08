from django import forms
from datetime import datetime, timedelta
from .models import BloodType
from accounts.models import CustomUser

def calculate_duration(open_time, close_time):
    open_dt = datetime.combine(datetime.today(), open_time)
    close_dt = datetime.combine(datetime.today(), close_time)

    # Handle overnight case (e.g., 10PM–6AM)
    if close_time < open_time:
        close_dt += timedelta(days=1)

    duration = (close_dt - open_dt).seconds / 3600
    return duration



class BloodRequestForm(forms.Form):
    blood_type = forms.IntegerField(
        required=True,
        error_messages={
            'required': 'Please select a blood type.',
        }
    )

    quantity = forms.IntegerField(
        required=False,
    )
    urgency = forms.CharField(
        required=False,
    )
    time_open = forms.TimeField(
        required=False,
    )
    time_close = forms.TimeField(
        required=False,
    )

    days_open = forms.CharField(
        required=True,
        error_messages={
            'required': 'You must set the days you are open in a week.',
        }
    )

    def clean(self):
        cleaned_data = super().clean()
        time_open = cleaned_data.get('time_open')
        time_close = cleaned_data.get('time_close')

        # Only validate if both fields are filled
        if time_open and time_close:
            duration = calculate_duration(time_open, time_close)

            if duration < 1:
                self.add_error('time_open', 'The duration must be at least 1 hour.')
            elif duration > 24:
                self.add_error('time_open', 'The duration cannot exceed 24 hours.')

        return cleaned_data
    


class DonationForm(forms.Form):

    donor = forms.IntegerField(
        required=True,
        error_messages={
            'required': 'Select a user.',
        }
    )

    blood_type = forms.IntegerField(
        required=True,
        error_messages={
            'required': 'Select a blood type.',
        }
    )

    date = forms.DateField(
        required=True,
        error_messages={
            'required': 'Pick a date.',
        }
    )

    notes = forms.CharField(
        required=False,
    )



class AppointmentForm(forms.Form):

    request = forms.IntegerField()

    date = forms.DateField(
        required=True,
        error_messages = {
            'required' : 'Pick a date', 
        }
    )

    time_start = forms.TimeField(
        required=True,
        error_messages={
            'required' : 'Pick a time slot',
        }
    ) 

    time_end = forms.TimeField(
        required=False
    ) 
