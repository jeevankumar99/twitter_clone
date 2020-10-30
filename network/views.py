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
    
    # get user, followers and following users
    user = User.objects.get(username=username)
    followers = Follower.objects.filter(user=user)
    following = Follower.objects.filter(follower=user)

    # serialize each user to useable strings for javascript
    followers = [follower_obj.serialize('followers') for follower_obj in followers]
    following = [following_obj.serialize('following') for following_obj in following]
    
    # checks if the logged in user is following the user in the current page
    if str(request.user) == username:
        is_following = False
        disable_button = True
    else:
        disable_button = False
        current_user = User.objects.get(username=request.user)
        if len(Follower.objects.filter(user=user, follower=current_user)) > 0:
            is_following = True
        else: 
            is_following = False 
    
    # converts the data into a dict to return as JsonRepsonse
    json_dict = {
        'followers': followers,
        'following': following,
        'isFollowing': is_following,
        'disableButton' : disable_button,
    }
    
    return JsonResponse(json_dict, safe=False)


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

@csrf_exempt
def update_followers(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Request method should be POST"}, 400)
    data = json.loads(request.body)
    current_user = str(request.user)
    target_user = data.get('target_user')
    update_type = data.get('type')
    current_user = User.objects.get(username=current_user)
    target_user = User.objects.get(username=target_user)

    if update_type == "Follow":
        Follower.objects.create(user=target_user, follower=current_user)
    else:
        Follower.objects.get(user=target_user, follower=current_user).delete()
    
    return HttpResponse("Followers Updated!")
