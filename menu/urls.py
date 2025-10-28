from django.urls import path
from . import views

urlpatterns = [
    path("categories/", views.categories_view, name="categories"),
    path("add/", views.add_menu_item, name="add_menu_item"),
    path("list/", views.menu_list, name="menu_list"),
]

