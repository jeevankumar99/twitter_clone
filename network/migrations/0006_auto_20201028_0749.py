# Generated by Django 3.0.8 on 2020-10-28 07:49

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0005_followers'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Followers',
            new_name='Follower',
        ),
    ]