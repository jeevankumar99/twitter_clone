# Generated by Django 3.0.8 on 2020-11-03 18:32

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0007_likes'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Likes',
            new_name='Like',
        ),
    ]
