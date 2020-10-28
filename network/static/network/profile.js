class FollowButtons extends React.Component {
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
            <button onClick={this.toggleFollowing} id="follow-button">{this.state.buttonText}</button>
        )
    }
}

ReactDOM.render(<FollowButtons />, document.querySelector('#follow-buttons'));