from django.shortcuts import render
from rest_framework import viewsets

# Create your views here.
# api/views.py

from .models import (
    Recurrence,
    Bill_Status,
    Bank_Account,
    Bills,
    Due_Bills,
    Bank_Account_Instance
)
from .serializers import (
    RecurrenceSerializer,
    BillStatusSerializer,
    BankAccountSerializer,
    BillSerializer,
    DueBillSerializer,
    BankAccountInstanceSerializer
)

class RecurrenceViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Recurrence patterns to be viewed or edited.
    """
    queryset = Recurrence.objects.all().order_by('name') # Base queryset
    serializer_class = RecurrenceSerializer # Link to the serializer
    # permission_classes = [permissions.IsAuthenticated] # Optional: Add permissions later

class BillStatusViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Bill Statuses to be viewed or edited.
    """
    queryset = Bill_Status.objects.all().order_by('name')
    serializer_class = BillStatusSerializer
    # permission_classes = [permissions.IsAuthenticated]

class BankAccountViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Bank Accounts to be viewed or edited.
    """
    queryset = Bank_Account.objects.all().order_by('name')
    serializer_class = BankAccountSerializer
    # permission_classes = [permissions.IsAuthenticated]

class BillViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Bill definitions to be viewed or edited.
    """
    queryset = Bills.objects.all().order_by('name')
    serializer_class = BillSerializer
    # permission_classes = [permissions.IsAuthenticated]

class DueBillViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Due Bills (instances) to be viewed or edited.
    """
    queryset = Due_Bills.objects.all().order_by('due_date', 'priority')
    serializer_class = DueBillSerializer
    # permission_classes = [permissions.IsAuthenticated]

class BankAccountInstanceViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Bank Account Instances to be viewed or edited.
    """
    queryset = Bank_Account_Instance.objects.all().order_by('due_date', 'priority')
    serializer_class = BankAccountInstanceSerializer
    # permission_classes = [permissions.IsAuthenticated]