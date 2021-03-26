
let post_id = 0;

const emptyLikeIcon = "/static/network/images/empty-heart-icon.png";
const fullLikeIcon = "/static/network/images/heart-icon.png";
const userProfileIcon = "/static/network/images/default-profile-icon.png";

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

        // Checks if user is being followed and changes the button accordingly
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
                <ul id="followers-div">
                    <h5 className="follow-blocks">Followers: {this.state.followers}</h5>
                    <h5 className="follow-blocks">Following: {this.state.following}</h5>
                </ul>
                { !disableButton ? (
                    <div id="follower-buttons">
                        <button onClick={this.toggleFollowing} id="follow-button">{this.state.buttonText}</button>
                    </div>): (null)}
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
            likeButtonIcon: this.props.postData.like_icon,
            postType: 'post',
            content: <h4 id="post-content">{this.props.postData.content}</h4>,
            editButton: null,
            parentEditButton: <button  onClick={button => this.editPost(button)} className='edit-button' style={{ display: this.props.postData.displayState}}>Edit</button>,
        }
    }; 
    
    // Update likes for each post
    updateLikes = (button) => {
        if (this.state.likeButtonState === 'Like') {
            this.setState(state => ({
                likes: state.likes + 1,
                likeButtonState: 'Unlike',
                likeButtonIcon: fullLikeIcon,
            }));
        }
        else {
            this.setState(state => ({
                likes: state.likes - 1,
                likeButtonState: 'Like',
                likeButtonIcon: emptyLikeIcon,
            }));
        }
        fetch(`/update_likes/${this.props.postData.id}`)
    }

    // Dynamically allows user to edit post
    editPost = () => {
        this.setState(state => ({
           postType: 'edit',
           content: <textarea onClick={this.expandTextArea} id="edited-content">{this.props.postData.content}</textarea>,
           editButton: <button onClick={this.updatePost} id="submit-edit-post">Save</button>,
           parentEditButton: null,
        })); 
       post_id = this.props.postData.id;
    }

    // Start the grow animation to let the user edit the post.
    expandTextArea = () => {
        console.log('textarea clicked!')
        let editedContent = document.querySelector('#edited-content');
        editedContent.style.animationName = 'grow';
        editedContent.style.animationPlayState = 'running';
        editedContent.style.animationDuration = '2s';
    }

    // Updates post's content without reloading the page.
    updatePost = () => {
        let editedContent = document.querySelector('#edited-content');
        let newContent = editedContent.value;
        this.props.postData.content = newContent;

        // If textarea is expanded, start shrink animation
        if (editedContent.style.animationName === 'grow') {
            editedContent.style.animationName = 'shrink';
            setTimeout(() => {
                this.setState(state => ({
                    postType: 'post',
                    content: <h4 id="post-content">{newContent}</h4>,
                    editButton: null,
                    parentEditButton: <button  onClick={button => this.editPost(button)} className='edit-button' style={{ display: this.props.postData.displayState}}>Edit</button>
                }))
            }, 2000);
        }

        // Else directly save the post without animation.
        else {
            this.setState(state => ({
                postType: 'post',
                content: <h4 id="post-content">{newContent}</h4>,
                editButton: null,
                parentEditButton: <button  onClick={button => this.editPost(button)} id='edit-button' style={{ display: this.props.postData.displayState}}>Edit</button>
            }))
        }

        // Update it in the Database.
        createNewPost('PUT');
    }

    
    render () {
        return (
            <div className="post-container">
            <div className="user-edit-div">
                <div className="user-profile-pic">
                    <img src={userProfileIcon} className="user-profile-icon"/>
                </div>
                <div className="post-username">
                    <a href={"/profiles/" + this.props.postData.username}>{this.props.postData.username}</a>
                </div>
                <div className="post-edit-div">{this.state.parentEditButton}</div>
            </div>
            <div className="post-timestamp">Posted on {this.props.postData.timestamp}</div>
            <div className="post-contents-div">
                {this.state.content}
                {this.state.editButton}
            </div>
            <div className="like-info-div"> 
                <div className="like-count">{this.state.likes}</div>
                <div className="like-button-div">
                    <img src={this.state.likeButtonIcon} onClick={button => this.updateLikes(button)} className="like-button"/>
                </div>
            </div>
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
                post.displayState = "inline";
            }
            post.currentUser = user_id.innerHTML;
            if (post.like_status === 'Unlike') {
                post.like_icon = fullLikeIcon;
            }
            else {
                post.like_icon = emptyLikeIcon;
            }
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
