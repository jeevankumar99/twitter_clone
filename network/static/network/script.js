
class UserDiv extends React.Component {
    render () {
        return (
            <div className="post-username">
            <h5>{this.props.username} Posted</h5>
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
    };  
    incrementLike = () => {
        this.setState(state => ({
            likes: state.likes + 1
        }));
    }

    render () {
        console.log(this.props.postData);
        return (
            <div className="post-container">
                <UserDiv username={this.props.postData.username}/>
                <p>{this.props.postData.timestamp}</p>
                <div className="post-contents">
                    <h4>{this.props.postData.content}</h4>
                </div>
                <h5> This post has {this.state.likes} Likes.</h5>
                <button onClick={this.incrementLike} id="like-button">Like</button>
            </div>
        )
    }
}

initiateElements();

function initiateElements() {
    loadPosts();
    let newPostButton = document.querySelector('#submit-new-post');
    newPostButton.addEventListener('click', createNewPost);
}

function loadPosts() {
    fetch('/get_posts')
    .then(response => response.json())
    .then(data => {
        console.log(data);
        data.forEach(post => {
            const post_div = document.createElement('div');
            ReactDOM.render(<Post postData={post}/>, post_div);
            document.querySelector('#all-posts-container').appendChild(post_div);
        });
    });
}

function createNewPost() {
    fetch('/new_post', {
        method: 'POST', 
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