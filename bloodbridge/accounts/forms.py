from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser
from django.contrib.auth.forms import AuthenticationForm




class CustomUserCreationForm(UserCreationForm):
    username = forms.EmailField(
        error_messages={
            'invalid': "Please enter a valid email address.",
            'unique': "That email is already registered.",
            'required': "Email is required.",
        }
    )

    password1 = forms.CharField(
        error_messages={
            'invalid': "Please enter a valid password.",
            'required': "Password is required.",
        }
    )

    password2 = forms.CharField(
        error_messages={
            'required': "Please confirm your password.",
            'invalid': "Passwords do not match.",
        }
    )

    class Meta:
        model = CustomUser
        fields = ['username', 'password1', 'password2']


    def save(self, commit=True):
        user = super().save(commit=False)
        user.role = 'user'

        if (commit):
            user.save()

        return user


# forms.py
class HospitalCreationForm(CustomUserCreationForm):
    name = forms.CharField(
        max_length=255,
        error_messages={'required': "Hospital name is required."}
    )

    class Meta(CustomUserCreationForm.Meta):
        fields = CustomUserCreationForm.Meta.fields + ['name']

    def save(self, commit=True):
        user = super().save(commit=False)
        user.role = 'hospital'
        user.is_approved = False    # mark as pending
        user.is_active = False      # prevent login until approved
        if commit:
            user.save()
            if hasattr(user, 'profile'):
                profile = user.profile
                profile.hospital_name = self.cleaned_data['name']
                profile.save()
        return user



class CustomAuthenticationForm(AuthenticationForm):
    username = forms.EmailField(
        error_messages={
            'required': "Email is required.",
            'invalid': "Please enter a valid email address.",
        }
    )

    password = forms.CharField(
        error_messages={
            'required': "Password is required.",
            'invalid': "Incorrect password.",
        }
    )
