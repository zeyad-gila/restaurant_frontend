from django.shortcuts import render

def login_view(request):
    return render(request, "users/login.html")

def register_view(request):
    return render(request, "users/register.html")

def verify_otp_view(request):
    return render(request, "users/verify_otp.html")
