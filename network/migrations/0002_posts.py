# Generated by Django 3.0.8 on 2020-10-21 11:55

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Posts',
            fields=[
                ('id', models.AutoField(editable=False, primary_key=True, serialize=False)),
                ('data_and_time', models.DateTimeField(default=django.utils.timezone.now)),
                ('content', models.TextField(max_length=512)),
                ('likes', models.IntegerField(default=0)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='author', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
