# Generated by Django 5.2 on 2025-04-09 21:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_recurrence_bank_account_instance_recurrence_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='due_bills',
            name='total_amount_due',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True),
        ),
    ]
