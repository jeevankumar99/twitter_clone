
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("new_post/<int:post_id>", views.create_and_update_posts, name="new_post"),
    path("get_posts", views.get_posts, name="get_posts"),
    path("profiles/<str:username>", views.profile_page, name="profile_page"),
    path("followers/<str:username>", views.get_follower_info, name="followers_info"),
    path("update_followers", views.update_followers, name="update_followers"),
]
