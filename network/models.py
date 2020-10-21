from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.timezone import now


class User(AbstractUser):
    pass

class Post(models.Model):
    id = models.AutoField(primary_key=True, editable=False)
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name="author")
    data_and_time = models.DateTimeField(default=now, editable=True)
    content = models.TextField(max_length=512)
    likes = models.IntegerField(default=0)


