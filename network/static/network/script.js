
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

function toggleNewPost() {
    document.querySelector('#all-posts-container').style.display = 'none';
} 


let postData = {
    username: 'Jeevan',
    content: "Just landed in Maldives, this place is amazing!",
}

let newPostButton = document.querySelector('#new-post-button');
newPostButton.addEventListener('click', toggleNewPost);

ReactDOM.render(<Post postData={postData}/>, document.querySelector('#all-posts-container'));