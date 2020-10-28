class FollowerInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            following: false,
            buttonText: "Follow"
        }
    }
    toggleFollowing = () => {
        if (this.state.following) {
            this.setState(state => ({
                following: false,
                buttonText: "Follow"
            }))
        }
        else {
            this.setState(state => ({
                following: true,
                buttonText: "Unfollow"
            }))
        }
    }
    render() {
        return (
            <div>
                <div id="followers-div">
                    <h5>Followers: {this.props.followers}</h5>
                </div>
                <div id="follower-buttons">
                    <button onClick={this.toggleFollowing} id="follow-button">{this.state.buttonText}</button>
                </div>
            </div>
        )
    }
}

displayFollowersAndButtons()

function displayFollowersAndButtons() {
    let username = String(window.location.pathname).slice(10,)
    fetch(`/followers/${username}`)
    .then(response => response.json())
    .then(data => {
        console.log(data, Object.keys(data).length)
        ReactDOM.render(<FollowerInfo followers={Object.keys(data).length} />, document.querySelector('#followers-info'));
    })
}
