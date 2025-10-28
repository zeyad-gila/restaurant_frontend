from django.shortcuts import render

def categories_view(request):
    return render(request, "menu/categories.html")


def add_menu_item(request):
    return render(request, "menu/menu_add.html")

def menu_list(request):
    return render(request, "menu/menu_list.html")