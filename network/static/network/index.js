
// publically declared to pass post_id to multiple functions when needed.
let post_id = 0;

const likeIcon = "https://www.clipartmax.com/png/middle/349-3495331_jewlr-instagram-like-icon-png.png";
const emptyLikeIcon = "https://lh3.googleusercontent.com/proxy/Edd_dP5sNInJYWVjUdXSqMChwknIPIw-Os8R41EeJSeqLyDa-gSfZnFN2Q41ZqK3Gi6KxREbDWMTj58bWy9GAeemWIXweibx1mloPKnYdrHc0dVIDdgPh1Ip2XuOS7IKBMrTy5N2ULQlD227XNmY7-LN1pN-djV4BEwianAg_kPORk-4c0c7";

class UserDiv extends React.Component {
    render () {
        return (
            <div className="post-username">
            <h5><a href={"/profiles/" + this.props.username}> {this.props.username} Posted</a></h5>
            </div>
        )
    }
}

class Post extends React.Component {
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

    // Dynamically allows users to edit post
    editPost = () => {
        this.setState(state => ({
           postType: 'edit',
           content: <textarea id="edited-content">{this.props.postData.content}</textarea>,
           editButton: <button onClick={this.updatePost} id="submit-edit-post">Post</button>,
           parentEditButton: null,
        })); 
       post_id = this.props.postData.id;
    }

    // Updates post's content without reloading the page.
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

// Calls all the neccessary functions to display the page.
function initiateElements() {
    let postsType = document.querySelector('#posts-type').innerHTML;
    postsType === 'following' ? (loadPosts('following')) : (loadPosts());
    let editPostButton = document.querySelector('#submit-edit-post');
    editPostButton.addEventListener('click', () => createNewPost('PUT'));
    let newPostButton = document.querySelector('#submit-new-post');
    newPostButton.addEventListener('click', () => createNewPost('POST'));
    window.onscroll = () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
            console.log("Scrolled down all the way!");
        }
    }
}

// Loads the posts into the DOM
function loadPosts(filter=null, page=1) {

    // Change layout of the DOM  to display posts.
    document.querySelector('#all-posts-container').style.display = 'block';
    document.querySelector('#submit-edit-post').style.display = 'none';
    document.querySelector('#submit-new-post').style.display = 'block';
    document.querySelector('#post-type').innerHTML = "New Post";
    document.querySelector('#new-post-content').value = "Write Something...";
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
                post.displayState = "block";
            }
            post.currentUser = user_id.innerHTML;
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
    .then(() => {
        type === 'POST' ? (loadPosts()) : (null);
    })
}