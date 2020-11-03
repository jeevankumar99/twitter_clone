from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.deletion import CASCADE
from django.utils.timezone import now


class User(AbstractUser):
    pass

class Like(models.Model):
    post = models.ForeignKey('Post', on_delete=models.CASCADE, related_name="liked_post")
    user = models.ForeignKey('User', on_delete=models.DO_NOTHING, related_name="liked_user")

class Post(models.Model):
    id = models.AutoField(primary_key=True, editable=False)
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name="author")
    timestamp = models.DateTimeField(default=now, editable=True)
    content = models.TextField(max_length=512)

    def serialize(self, like_status, likes):
        return {
            'id': self.id,
            'username': self.user.username,
            'content': self.content,
            'likes': likes,
            'timestamp': self.timestamp.strftime("%m/%d/%Y, %H:%M:%S"),
            'like_status': like_status
        }

class Follower(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name="followed_user")
    follower = models.ForeignKey('User', on_delete=models.DO_NOTHING, related_name="follower")

    def serialize(self, return_type):
        if return_type == 'followers':
            return {
                'follower': self.follower.username
            }
        else:
            return {
                'following': self.user.username
            }



