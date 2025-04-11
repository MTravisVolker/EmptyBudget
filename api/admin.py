from django.contrib import admin

# Register your models here.

# api/admin.py

from .models import (
    Bill_Status,
    Bank_Account,
    Bills,
    Due_Bills,
    Bank_Account_Instance,
    Recurrence
)

# Use the @admin.register decorator for a cleaner way to register
# and customize the admin interface for each model.

@admin.register(Bill_Status)
class BillStatusAdmin(admin.ModelAdmin):
    """Admin interface customization for Bill_Status."""
    list_display = ('name', 'highlight_color_hex', 'archived', 'id') # Fields to show in the list view
    list_filter = ('archived',) # Fields to allow filtering by
    search_fields = ('name',) # Fields to enable searching on
    list_per_page = 25 # How many items per page

# In api/admin.py
from .models import Recurrence # Add Recurrence to your imports

@admin.register(Recurrence)
class RecurrenceAdmin(admin.ModelAdmin):
    list_display = ('name', 'calculation', 'archived', 'id')
    list_filter = ('archived',)
    search_fields = ('name', 'calculation')

@admin.register(Bank_Account)
class BankAccountAdmin(admin.ModelAdmin):
    """Admin interface customization for Bank_Account."""
    list_display = ('name', 'font_color_hex', 'archived', 'id')
    list_filter = ('archived',)
    search_fields = ('name',)
    list_per_page = 25


@admin.register(Bills)
class BillsAdmin(admin.ModelAdmin):
    """Admin interface customization for Bills (Definitions)."""
    list_display = ('name', 'default_amount_due', 'default_draft_account', 'url', 'archived', 'id')
    list_filter = ('archived', 'default_draft_account')
    search_fields = ('name', 'url')
    list_select_related = ('default_draft_account',) # Optimize query for ForeignKey display
    list_per_page = 25


@admin.register(Due_Bills)
class DueBillsAdmin(admin.ModelAdmin):
    """Admin interface customization for Due_Bills (Instances)."""
    list_display = (
        'bill',
        'due_date',
        'total_amount_due',
        'status',
        'pay_date',
        'draft_account',
        'priority',
        'archived',
        'id'
    )
    list_filter = ('status', 'archived', 'due_date', 'pay_date', 'bill', 'draft_account', 'priority')
    search_fields = ('bill__name', 'confirmation', 'notes') # Use __name to search related Bill's name
    date_hierarchy = 'due_date' # Adds date drill-down navigation
    list_select_related = ('bill', 'status', 'draft_account') # Optimize queries
    list_per_page = 50
    # Example of field ordering in the edit form:
    # fields = ('bill', ('due_date', 'pay_date'), ('min_amount_due', 'total_amount_due'), 'status', 'draft_account', 'priority', 'confirmation', 'notes', 'archived')


@admin.register(Bank_Account_Instance)
class BankAccountInstanceAdmin(admin.ModelAdmin):
    """Admin interface customization for Bank_Account_Instance."""
    list_display = (
        'bank_account',
        'name',
        'due_date',
        'status',
        'current_balance', # Or 'amount' if renamed
        'pay_date',
        'priority',
        'archived',
        'id'
    )
    list_filter = ('status', 'archived', 'due_date', 'pay_date', 'bank_account', 'priority')
    search_fields = ('name', 'bank_account__name') # Search related Bank_Account name
    date_hierarchy = 'due_date'
    list_select_related = ('bank_account', 'status') # Optimize queries
    list_per_page = 50


# --- Alternative Simple Registration (without customization) ---
# If you don't need customizations yet, you could just do:
#
# from django.contrib import admin
# from .models import Bill_Status, Bank_Account, Bills, Due_Bills, Bank_Account_Instance
#
# admin.site.register(Bill_Status)
# admin.site.register(Bank_Account)
# admin.site.register(Bills)
# admin.site.register(Due_Bills)
# admin.site.register(Bank_Account_Instance)
#
# However, using ModelAdmin classes as shown above is much more flexible.