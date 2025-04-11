from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator # Optional: For hex color validation later

# api/models.py

# Create your models here.

class Recurrence(models.Model):
    """
    Defines recurrence patterns (e.g., Monthly, Weekly, Annually).
    """
    id = models.SmallAutoField(primary_key=True) # Explicitly using SmallAutoField for SMALLSERIAL
    name = models.CharField(max_length=100, unique=True) # Recurrence names should be unique
    calculation = models.CharField(
        max_length=100,
        blank=True, # Allow blank if name is self-explanatory or calc is done elsewhere
        help_text="Optional: Description or parameters for calculation (e.g., 'Every 1st', 'Bi-Weekly', JSON/Cron string)"
    )
    archived = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Recurrence Pattern"
        verbose_name_plural = "Recurrence Patterns"
        ordering = ['name']


class Bill_Status(models.Model):
    """
    Represents the status of a bill payment (e.g., Estimated, Confirmed, Paid, Cleared).
    """
    id = models.SmallAutoField(primary_key=True) # Explicitly using SmallAutoField for SMALLSERIAL
    name = models.CharField(max_length=100, unique=True) # Status names should likely be unique
    archived = models.BooleanField(default=False)
    highlight_color_hex = models.CharField(
        max_length=7,
        # validators=[RegexValidator(regex='^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$', message='Enter a valid hex color code (e.g., #RRGGBB)')] # Optional: Add validation
        help_text="Hex color code for highlighting (e.g., #FFFFFF)"
    )

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Bill Status"
        verbose_name_plural = "Bill Statuses"


class Bank_Account(models.Model):
    """
    Represents a bank account (Checking, Savings, Credit Card, etc.).
    """
    id = models.SmallAutoField(primary_key=True) # Explicitly using SmallAutoField for SMALLSERIAL
    name = models.CharField(max_length=100)
    archived = models.BooleanField(default=False)
    font_color_hex = models.CharField(
        max_length=7,
        # validators=[RegexValidator(regex='^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$', message='Enter a valid hex color code (e.g., #RRGGBB)')] # Optional: Add validation
        help_text="Hex color code for font display (e.g., #000000)"
    )

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Bank Account"
        verbose_name_plural = "Bank Accounts"


class Bills(models.Model):
    """
    Represents a recurring bill definition (e.g., Rent, Netflix, Phone).
    """
    id = models.SmallAutoField(primary_key=True) # Explicitly using SmallAutoField for SMALLSERIAL
    name = models.CharField(max_length=100)
    default_amount_due = models.DecimalField(max_digits=10, decimal_places=2)
    url = models.CharField(max_length=100, blank=True, null=True) # URLs are often optional
    archived = models.BooleanField(default=False)
    default_draft_account = models.ForeignKey(
        Bank_Account,
        on_delete=models.SET_NULL, # Keep bill definition if account is deleted, just remove link
        null=True, # Allow no default account
        blank=True, # Allow no default account in forms/admin
        related_name='default_bills', # How to refer to this from Bank_Account
        help_text="Default account this bill is usually paid from"
    )

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Bill Definition"
        verbose_name_plural = "Bill Definitions"


class Due_Bills(models.Model):
    """
    Represents a specific instance of a bill that is due or has been paid.
    """
    id = models.SmallAutoField(primary_key=True) # Explicitly using SmallAutoField for SMALLSERIAL
    bill = models.ForeignKey(
        Bills,
        on_delete=models.CASCADE, # If the Bill definition is deleted, delete its due instances too
        related_name='due_instances'
    )
    priority = models.IntegerField( 
        default=0,
        validators=[MinValueValidator(0)], # Example validation
        help_text="Priority for sorting/display (e.g., 0=Normal, 1=High)"
    )
    due_date = models.DateField()
    pay_date = models.DateField(null=True, blank=True)
    min_amount_due = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    # --- MODIFIED FIELD ---
    total_amount_due = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,  # Allow the database column to store NULL values
        blank=True  # Allow the field to be blank in forms (like the admin)
    )
    # --- END MODIFIED FIELD ---

    status = models.ForeignKey(
        Bill_Status,
        on_delete=models.PROTECT, # Prevent deleting a status if due bills are using it
        related_name='due_bills'
    )
    archived = models.BooleanField(default=False)
    confirmation = models.CharField(max_length=100, blank=True, null=True) # Confirmation codes are optional
    notes = models.TextField(blank=True, null=True) # Notes are optional
    draft_account = models.ForeignKey(
        Bank_Account,
        on_delete=models.SET_NULL, # Keep the due bill record if the draft account is deleted
        null=True,
        blank=True,
        related_name='due_bills_drafts',
        help_text="Account the payment was/will be drafted from for this specific instance"
    )
    # --- ADDED FIELD ---
    recurrence = models.ForeignKey(
        Recurrence,
        on_delete=models.SET_NULL, # Keep historical record if recurrence type deleted
        null=True, # Allow one-off bills not linked to a recurrence
        blank=True, # Allow blank in forms/admin
        related_name='due_bills',
        help_text="The recurrence pattern associated with this bill instance, if any."
    )
    # --- END ADDED FIELD ---

    def __str__(self):
        # Handle case where bill might be deleted unexpectedly if CASCADE wasn't enforced properly
        bill_name = self.bill.name if self.bill else "Deleted Bill"
        return f"{bill_name} due {self.due_date}"

    class Meta:
        verbose_name = "Due Bill / Bill Instance"
        verbose_name_plural = "Due Bills / Bill Instances"
        ordering = ['due_date', 'priority'] # Example default ordering


class Bank_Account_Instance(models.Model):
    """
    Represents a specific scheduled transaction or balance snapshot related to a bank account.
    (Purpose might need refinement - e.g., is it for transfers, budget goals, historical balances?)
    """
    id = models.SmallAutoField(primary_key=True) # Explicitly using SmallAutoField for SMALLSERIAL
    bank_account = models.ForeignKey(
        Bank_Account,
        on_delete=models.CASCADE, # If the bank account is deleted, delete these instances
        related_name='instances'
    )
    priority = models.IntegerField(default=0, help_text="Priority for sorting/display") # Note: lowercase convention preferred
    due_date = models.DateField(help_text="Date this instance is scheduled for or occurred on")
    pay_date = models.DateField(null=True, blank=True, help_text="Actual date this instance was actioned/paid")
    name = models.CharField(max_length=100, help_text="Description (e.g., 'Transfer to Savings', 'Payday Deposit')")
    status = models.ForeignKey(
        Bill_Status, # Assuming the same statuses apply here. Could be a different Status model if needed.
        on_delete=models.PROTECT, # Prevent deleting a status if instances are using it
        related_name='bank_account_instances'
    )
    archived = models.BooleanField(default=False)
    # Ambiguous field name: Is this the balance *at that time* or the *amount* of the transaction?
    # Renaming to 'amount' might be clearer if it represents a transaction value.
    # Assuming it means 'amount' for now.
    current_balance = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True, # Allow null if it represents a non-monetary event?
        blank=True,
        help_text="Amount related to this instance (e.g., transfer amount). Or balance snapshot on due_date."
    )
    # --- ADDED FIELD ---
    recurrence = models.ForeignKey(
        Recurrence,
        on_delete=models.SET_NULL, # Keep historical record if recurrence type deleted
        null=True, # Allow one-off instances not linked to a recurrence
        blank=True, # Allow blank in forms/admin
        related_name='bank_account_instances',
        help_text="The recurrence pattern associated with this instance, if any."
    )
    # --- END ADDED FIELD ---

    def __str__(self):
        # Handle case where bank_account might be deleted unexpectedly
        account_name = self.bank_account.name if self.bank_account else "Deleted Account"
        return f"{account_name} - {self.name} ({self.due_date})"

    class Meta:
        verbose_name = "Bank Account Instance/Transaction"
        verbose_name_plural = "Bank Account Instances/Transactions"
        ordering = ['due_date', 'priority']