# Generated by Django 3.0.8 on 2020-11-03 18:52

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0008_auto_20201103_1832'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='post',
            name='likes',
        ),
    ]