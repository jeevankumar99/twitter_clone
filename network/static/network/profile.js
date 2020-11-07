
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
            likeButtonState: this.props.postData.like_status, 
            postType: 'post',
            content: <h4 id="post-content">{this.props.postData.content}</h4>,
            editButton: null,
            parentEditButton: <button  onClick={button => this.editPost(button)} id='edit-button' style={{ display: this.props.postData.displayState}}>Edit</button>,
        }
    }; 
    
    // Update likes for each post
    updateLikes = (button) => {
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

    // Dynamically allows user to edit post
    editPost = () => {
        this.setState(state => ({
           postType: 'edit',
           content: <textarea id="edited-content">{this.props.postData.content}</textarea>,
           editButton: <button onClick={this.updatePost} id="submit-edit-post">Post</button>,
           parentEditButton: null,
        })); 
       post_id = this.props.postData.id;
    }

    // Updates the post content without reloading the page
    updatePost = () => {
        console.log('update post executing!');
        let newContent = document.querySelector('#edited-content').value;
        this.setState(state => ({
            postType: 'post',
            content: <h4 id="post-content">{newContent}</h4>,
            editButton: null,
            parentEditButton: <button  onClick={button => this.editPost(button)} id='edit-button' style={{ display: this.props.postData.displayState}}>Edit</button>
        }))
        createNewPost('PUT');
    }

    
    render () {
        return (
            <div className="post-container">
                <UserDiv username={this.props.postData.username}/>
                <p>{this.props.postData.timestamp}</p>
                {this.state.parentEditButton}
                <div className="post-contents-div">
                    {this.state.content}
                    {this.state.editButton}
                </div>
                <h5> This post has {this.state.likes} Likes.</h5>
                <button onClick={button => this.updateLikes(button)} className="like-button">{this.state.likeButtonState}</button>
            </div>
        )
    }
}

initiateElements();

// Calls all neccessary functions to load profile elements
function initiateElements() {
    displayFollowersAndButtons();
    loadUserPosts();
    let followPostButton = document.querySelector('#follow-post-button');
    followPostButton.addEventListener('click', () => {
        loadUserPosts('following');
    })
}

// Gets followers and buttons for profile pages
function displayFollowersAndButtons() {
    let username = String(window.location.pathname).slice(10,)
    fetch(`/followers/${username}`)
    .then(response => response.json())
    .then(data => {
        data.isFollowing ? (data.buttonText = 'Unfollow') : (data.buttonText = 'Follow');
        ReactDOM.render(<FollowerInfo data={data}/>, document.querySelector('#followers-info'));
    })
}

// Loads user posts into DOM
function loadUserPosts(page=1) {
    let user = String(window.location.pathname).slice(10,)
    document.querySelector('#user-posts').textContent = '';
    document.querySelector('#user-posts').style.display = 'block';
    
    // To scroll to the top after clicking next to previous button
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Get 10 posts from backend
    fetch(`/get_posts/${user}?page=${page}`)
    .then(response => response.json())
    
    // Load the 10 posts into the DOM
     .then(data => {
        data.forEach(post => {

            // To load only valid posts into the DOM
            if (post.id !== null) {
                const post_div = document.createElement('div');
            const user_id = document.querySelector('#user-id');
            post.displayState= "none";
            if (post.username == user_id.innerHTML) {
                post.displayState = "block";
            }
            post.currentUser = user_id.innerHTML;
            ReactDOM.render(<ProfilePost postData={post}/>, post_div);
            document.querySelector('#user-posts').appendChild(post_div);
            }
        });
        return data;
    })

    // Add Next and Previous buttons at the end of 10 posts.
    .then((data) => {

        // Skip previous button for first page
        if (page != 1) {
            let prevButton = document.createElement('button');
            prevButton.innerHTML = "Previous";
            prevButton.addEventListener('click', () => {
                loadUserPosts(page - 1)
            })
            document.querySelector('#user-posts').appendChild(prevButton);
        }

        // Skip next button for the last page
        if (data[0].nextPageExists === true) {
            let nextButton = document.createElement('button');
            nextButton.innerHTML = "Next";
            nextButton.addEventListener('click', () => {
                loadUserPosts(page + 1)
            })
            document.querySelector('#user-posts').appendChild(nextButton);
        }
    })

    // Catch any errors
    .catch(error => console.log(error));
}

// Used to update edited posts in the backend.
function createNewPost(type) {
    console.log('createNewPost is working!', type)
    fetch(`/create_and_update_posts/${post_id}`, {
        method: type, 
        body: JSON.stringify({
            content: document.querySelector('#edited-content').value
        })
    })
}
