
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
}

function loadPosts(filter=null) {
    console.log(filter);
    document.querySelector('#all-posts-container').style.display = 'block';
    document.querySelector('#all-posts-container').textContent = '';
    document.querySelector('#submit-edit-post').style.display = 'none';
    document.querySelector('#submit-new-post').style.display = 'block';
    document.querySelector('#post-type').innerHTML = "New Post";
    document.querySelector('#new-post-content').value = "Write Something...";
    fetch(`/get_posts/${filter}`)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        data.forEach(post => {
            const post_div = document.createElement('div');
            const user_id = document.querySelector('#user-id');
            post.displayState= "none";
            if (post.username == user_id.innerHTML) {
                post.displayState = "block";
            }
            post.currentUser = user_id.innerHTML;
            ReactDOM.render(<Post postData={post}/>, post_div);
            document.querySelector('#all-posts-container').appendChild(post_div);
        });
    });
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