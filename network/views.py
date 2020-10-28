import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.http.response import JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from .models import User, Post, Follower

@login_required(login_url='/login')
def index(request):
    return render(request, "network/index.html")

def get_posts(request):
    posts = Post.objects.all()
    posts = posts.order_by('-timestamp').all()
    json_posts = JsonResponse([post.serialize() for post in posts], safe=False)
    return json_posts


def get_follower_info(request, username):
    user = User.objects.get(username=username)
    followers = Follower.objects.filter(user=user)
    print(followers)

    json_followers = JsonResponse([follower_obj.serialize() for follower_obj in followers], safe=False)
    return json_followers


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

@csrf_exempt
def create_and_update_posts(request, post_id):

    # get data from request
    data = json.loads(request.body)
    content = data.get("content")
    likes = data.get("likes")
    
    # edit existing post
    if request.method == 'PUT':
        post = Post.objects.get(id=post_id)
        if likes != None:
            print ("it is working", likes)
            post.likes = likes
        else:
            post.content = content
        post.save()
        return HttpResponse("Post Edited!")
    
    # create post
    elif request.method == 'POST':
        user = User.objects.get(username=request.user)
        Post.objects.create(user=user, content=content)
        return HttpResponse("Post Created!")
    
    else:
        return JsonResponse({'error': "Request must be PUT or POST"}, 400)

def profile_page(request, username):
    user = User.objects.get(username=username)
    return render(request, "network/profile.html", {
        'username': user.username,
        'followers': None, #pass followers model
        'following': None,  #pass following model
    })

def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
