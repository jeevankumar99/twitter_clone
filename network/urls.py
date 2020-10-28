
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("new_post/<int:post_id>", views.new_post, name="new_post"),
    path("get_posts", views.get_posts, name="get_posts"),
    path("profiles/<str:username>", views.profile_page, name="profile_page"),
]
