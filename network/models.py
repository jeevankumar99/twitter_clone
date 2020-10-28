from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.deletion import CASCADE
from django.utils.timezone import now


class User(AbstractUser):
    pass

class Post(models.Model):
    id = models.AutoField(primary_key=True, editable=False)
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name="author")
    timestamp = models.DateTimeField(default=now, editable=True)
    content = models.TextField(max_length=512)
    likes = models.IntegerField(default=0)

    def serialize(self):
        return {
            'id': self.id,
            'username': self.user.username,
            'content': self.content,
            'likes': self.likes,
            'timestamp': self.timestamp.strftime("%m/%d/%Y, %H:%M:%S")
        }

class Follower(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name="followed_user")
    follower = models.ForeignKey('User', on_delete=models.DO_NOTHING, related_name="follower")



