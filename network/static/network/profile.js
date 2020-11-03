
class FollowerInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isFollowing: this.props.data.isFollowing,
            followers: this.props.data.followers.length,
            following: this.props.data.following.length,
            buttonText: this.props.data.buttonText
        }
    }
    toggleFollowing = () => {
        fetch(`/update_followers`, {
            method: 'POST', 
            body: JSON.stringify({
                target_user: String(window.location.pathname).slice(10,),
                type: this.state.buttonText,
            })
        })
        if (this.state.isFollowing) {
            this.setState(state => ({
                isFollowing: false,
                followers: this.state.followers - 1,
                buttonText: "Follow"
            }))
        }
        else {
            this.setState(state => ({
                isFollowing: true,
                followers: this.state.followers + 1,
                buttonText: "Unfollow"
            }))
        }
    }
    render() {
        let disableButton = this.props.data.disableButton
        if (this.props.data.isFollowing === "Not Applicable") {
            displayButton = false;
        }
        return (
            <div>
                <div id="followers-div">
                    <h5>Followers: {this.state.followers}</h5>
                    <h5>Following: {this.state.following}</h5>
                </div>
                { !disableButton ? (
                    <div id="follower-buttons">
                        <button onClick={this.toggleFollowing} id="follow-button">{this.state.buttonText}</button>
                    </div>): (null)}
            </div>
        )
    }
}

let post_id = 0;

class UserDiv extends React.Component {
    render () {
        return (
            <div className="post-username">
            <h5><a href={"/profiles/" + this.props.username}> {this.props.username} Posted</a></h5>
            </div>
        )
    }
}

class ProfilePost extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            likes: this.props.postData.likes,
            likeButtonState: this.props.postData.like_status
        }
    };  
    updateLikes = (button) => {
        console.log(button.target)
        if (this.state.likeButtonState === 'Like') {
            this.setState(state => ({
                likes: state.likes + 1,
                likeButtonState: 'Unlike',
            }));
            button.target.innerHTML = 'Unlike'
        }
        else {
            this.setState(state => ({
                likes: state.likes - 1,
                likeButtonState: 'Like',
            }));
            button.target.innerHTML = 'Like';
        }
        fetch(`/update_likes/${this.props.postData.id}`)
        button.target.innerHTML = this.state.likeButtonState
    }

    editPost = () => {
       document.querySelector('#all-posts-container').style.display = 'none';
       document.querySelector('#post-type').innerHTML = "Edit Post";
       document.querySelector('#new-post-content').value = this.props.postData.content;
       document.querySelector('#submit-new-post').style.display = 'none';
       document.querySelector('#submit-edit-post').style.display = 'block';
       post_id = this.props.postData.id;
       console.log('editPost working!') 
    }

    render () {
        return (
            <div className="post-container">
                <UserDiv username={this.props.postData.username}/>
                <p>{this.props.postData.timestamp}</p>
                <button  onClick={this.editPost} id='edit-button' style={{ display: this.props.postData.displayState}}>Edit</button>
                <div className="post-contents">
                    <h4>{this.props.postData.content}</h4>
                </div>
                <h5> This post has {this.state.likes} Likes.</h5>
                <button onClick={button => this.updateLikes(button)} className="like-button">{this.state.likeButtonState}</button>
            </div>
        )
    }
}

initiateElements();

function initiateElements() {
    displayFollowersAndButtons();
    loadUserPosts();
    let followPostButton = document.querySelector('#follow-post-button');
    followPostButton.addEventListener('click', () => {
        loadUserPosts('following');
    })
}

function displayFollowersAndButtons() {
    let username = String(window.location.pathname).slice(10,)
    fetch(`/followers/${username}`)
    .then(response => response.json())
    .then(data => {
        data.isFollowing ? (data.buttonText = 'Unfollow') : (data.buttonText = 'Follow');
        console.log(data, Object.keys(data).length);
        ReactDOM.render(<FollowerInfo data={data}/>, document.querySelector('#followers-info'));
    })
}

function loadUserPosts() {
    let user = String(window.location.pathname).slice(10,)
    fetch(`/get_posts/${user}`)
    .then(response => response.json())
    .then(data => {
        data.forEach(post => {
            const post_div = document.createElement('div');
            const user_id = document.querySelector('#user-id');
            post.displayState= "none";
            if (post.username == user_id.innerHTML) {
                post.displayState = "block";
            }
            post.currentUser = user_id.innerHTML;
            ReactDOM.render(<ProfilePost postData={post}/>, post_div);
            document.querySelector('#user-posts').appendChild(post_div);
        });
    });
}
