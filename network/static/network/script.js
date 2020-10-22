
class UserDiv extends React.Component {
    render () {
        return (
            <div className="post-username">
            <h1>{this.props.username} Posted</h1>
            </div>
        )
    }
}

class Post extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            likes: 0
        }
    }
    render () {
        return (
            <div className="post-container">
                <UserDiv username={this.props.postData.username}/>
                <div className="post-contents">
                    <p>{this.props.postData.content}</p>
                </div>
                <h5> This post has {this.state.likes} Likes.</h5>
            </div>
        )
    }
}

initiateElements();

function initiateElements() {
    //loadPosts();
    let newPostButton = document.querySelector('#submit-new-post');
    newPostButton.addEventListener('click', createNewPost);
}

function loadPosts() {
    // fetch get post
    //display posts.
}

function createNewPost() {
    fetch('/new_post', {
        method: 'POST', 
        body: JSON.stringify({
            content: document.querySelector('#new-post-content').value
        })
    })
}