from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView

urlpatterns = [
    # This handles the POST from your <form action="{% url 'set_language' %}">
    path('i18n/', include('django.conf.urls.i18n')),

    # Redirect root URL to login page
    path('', RedirectView.as_view(url='/login/', permanent=False)),

    # Your app routes
    path('admin/', admin.site.urls),
    path('', include('users.urls')),
    path('menu/', include('menu.urls')),
    path('carts/', include('cart.urls')),
]
