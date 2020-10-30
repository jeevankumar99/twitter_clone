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

displayFollowersAndButtons()

function displayFollowersAndButtons() {
    let username = String(window.location.pathname).slice(10,)
    fetch(`/followers/${username}`)
    .then(response => response.json())
    .then(data => {
        data.isFollowing ? (data.buttonText = 'Unfollow') : (data.buttonText = 'Follow');
        console.log(data, Object.keys(data).length);
        ReactDOM.render(<FollowerInfo data={data}/>, document.querySelector('#followers-info'));
    })
}
