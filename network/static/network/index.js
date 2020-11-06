
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

class Post extends React.Component {
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

function createNewPost(type) {
    console.log('createNewPost working!', type)
    fetch(`/new_post/${post_id}`, {
        method: type, 
        body: JSON.stringify({
            content: document.querySelector('#new-post-content').value
        })
    })
    .then(() => {
        document.querySelector('#new-post-content').value = '';
        document.querySelector('#all-posts-container').textContent = '';
        loadPosts();
    })
}