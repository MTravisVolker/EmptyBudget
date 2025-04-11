# api/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'recurrences', views.RecurrenceViewSet)
router.register(r'bill-statuses', views.BillStatusViewSet)
router.register(r'bank-accounts', views.BankAccountViewSet)
router.register(r'bills', views.BillViewSet)
router.register(r'due-bills', views.DueBillViewSet)
router.register(r'bank-account-instances', views.BankAccountInstanceViewSet)

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
]