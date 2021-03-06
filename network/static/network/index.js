
// publically declared to pass post_id to multiple functions when needed.
let post_id = 0;

const emptyLikeIcon = "static/network/images/empty-heart-icon.png";
const fullLikeIcon = "/static/network/images/heart-icon.png";
const userProfileIcon = "/static/network/images/default-profile-icon.png";

class Post extends React.Component {
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

    // Dynamically allows users to edit post
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

// Calls all the neccessary functions to display the page.
function initiateElements() {
    console.log('Elements initiated')
    let postsType = document.querySelector('#posts-type').innerHTML;
    postsType === 'following' ? (loadPosts('following')) : (loadPosts());
    let editPostButton = document.querySelector('#submit-edit-post');
    editPostButton.addEventListener('click', () => createNewPost('PUT'));
    let textArea = document.querySelector('textarea');
    let closeButton = document.createElement('button')
    
    let newPostButton = document.querySelector('#submit-new-post');
    newPostButton.addEventListener('click', () => {
        textArea.style.animationName = 'shrink';
        closeButton.style.display = 'none';
        createNewPost('POST');
    });
    
    closeButton.innerHTML = "Close";
    closeButton.id = 'post-close-button';
    closeButton.addEventListener('click', () => {
        console.log('close button clicked')
        textArea.style.animationName = 'shrink';
        closeButton.style.display = 'none';

    });
    let tempListItem = document.createElement('li');
    tempListItem.appendChild(closeButton);
    textArea.addEventListener('focusin', () => {
        textArea.style.outline = 'none';
        console.log('line 127 running');
        closeButton.style.display = 'inline-block'
        textArea.style.animationName = 'grow';
        textArea.style.animationPlayState = 'running';
        textArea.style.border = '0px';
        textArea.style.borderBottom = '1px solid rgb(29,161,242)';
        let buttonList = document.querySelector('#post-buttons-list');
        buttonList.insertBefore(tempListItem, buttonList.childNodes[0]);

    })
}

// Loads the posts into the DOM
function loadPosts(filter=null, page=1) {

    // Change layout of the DOM  to display posts.
    document.querySelector('#all-posts-container').style.display = 'block';
    document.querySelector('#submit-edit-post').style.display = 'none';
    document.querySelector('#submit-new-post').style.display = 'inline';
    document.querySelector('#post-type').innerHTML = "New Post";
    document.querySelector('#new-post-content').value = '';
    document.querySelector('#new-post-content').placeholder = "Write Something...";
    document.querySelector('#all-posts-container').textContent = '';

    // To scroll to the top after clicking next to previous button
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Get 10 posts from backend.
    fetch(`/get_posts/${filter}?page=${page}`)
    .then(response => response.json())

    // Load the 10 posts into the DOM
    .then(data => {
        console.log(data);
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
            ReactDOM.render(<Post postData={post}/>, post_div);
            document.querySelector('#all-posts-container').appendChild(post_div);
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
                loadPosts(filter, page - 1)
            })
            document.querySelector('#all-posts-container').appendChild(prevButton);
        }

        // Skip next button for the last page
        if (data[0].nextPageExists === true) {
            let nextButton = document.createElement('button');
            nextButton.innerHTML = "Next";
            nextButton.addEventListener('click', () => {
                loadPosts(filter, page + 1)
            })
            document.querySelector('#all-posts-container').appendChild(nextButton);
        }
    })

    // Catch any errors
    .catch(error => console.log(error));
}

// Create New Posts
function createNewPost(type) {
    let postContent;
    if (type === 'POST') {
        postContent = document.querySelector('#new-post-content').value;
    }
    else {
        postContent = document.querySelector('#edited-content').value;
    }
    console.log('createNewPost is working!', type)
    fetch(`/create_and_update_posts/${post_id}`, {
        method: type, 
        body: JSON.stringify({
            content: postContent,
        })
    })

    // Checks if post is edited or created
    .then(() => {
        type === 'POST' ? (loadPosts()) : (null);
    })
}