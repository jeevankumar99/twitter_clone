# Generated by Django 3.0.8 on 2020-10-26 15:35

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0003_auto_20201021_1200'),
    ]

    operations = [
        migrations.RenameField(
            model_name='post',
            old_name='data_and_time',
            new_name='timestamp',
        ),
    ]