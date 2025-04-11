# api/serializers.py

from rest_framework import serializers
from .models import (
    Recurrence,
    Bill_Status,
    Bank_Account,
    Bills,
    Due_Bills,
    Bank_Account_Instance
)

class RecurrenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recurrence
        fields = '__all__' # Include all fields from the Recurrence model

class BillStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bill_Status
        fields = '__all__' # Include all fields from the Bill_Status model

class BankAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bank_Account
        fields = '__all__' # Include all fields from the Bank_Account model

class BillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bills
        fields = '__all__' # Include all fields from the Bills model

class DueBillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Due_Bills
        fields = '__all__' # Include all fields from the Due_Bills model

class BankAccountInstanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bank_Account_Instance
        fields = '__all__' # Include all fields from the Bank_Account_Instance model