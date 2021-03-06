var React = require('react'),
    ReactRouter = require('react-router').Router,
    User = require('./user.jsx'),
    UserStore = require('../stores/user_store'),
    SessionStore = require('../stores/session_store.js'),
    FollowStore = require('../stores/follow_store.js'),
    ApiUtil = require('../util/api_util');


var UserShow = React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },
  getInitialState: function(){
    var userId = this.props.params.userId;
    var user = this._findUserById(userId) || {};
    return { user: user, currentUser: {}, followedUsers: []};
  },
  componentWillReceiveProps: function(newProps) {
    ApiUtil.fetchUser(newProps.params.userId);
    var user = UserStore.find(newProps.params.userId);
    var currentUserId = SessionStore.currentUser().id;
    var currentUser = UserStore.find(currentUserId);
    var followed = currentUser.followed_users;
    this.setState({user: user, currentUser: currentUser, followedUsers: followed});
  },
  _findUserById: function(id) {
    var res = UserStore.find(id);
    return res;
  },
  componentDidMount: function() {
    this.userListener = UserStore.addListener(this._userChanged);
    this.followListener = FollowStore.addListener(this._userChanged);
    ApiUtil.fetchUsers();
    ApiUtil.fetchFollows();
    ApiUtil.fetchCurrentUser();
    this.setState({ recordings: this.state.user.recordings});
  },
  _userChanged: function () {
    var userId = this.props.params.userId;
    var user = this._findUserById(userId);
    var current_user = SessionStore.currentUser().id;
    var currentUser = UserStore.find(current_user);
    var followed = currentUser.followed_users;
    var follow = FollowStore.find([current_user, this.props.params.userId]);
    this.setState({ user: user, currentUser: currentUser, followedUsers: followed, follow: follow});
  },
  componentWillUnmount: function () {
    this.userListener.remove();
    this.followListener.remove();
  },
  editClickHandler: function (id) {
    this.context.router.push("/users/" + id + "/edit");
  },
  deleteClickHandler: function (id) {
    ApiUtil.logout();
    ApiUtil.deleteUser(id);
    this.context.router.push("/");
  },
  handleFollowedClick: function (id) {
    this.context.router.push("users/" + id);
  },
  followClick: function(userPair) {
    var follower = userPair[0];
    var followed = userPair[1];
    formData = {follow: {
      follower_id: follower,
      followed_id: followed
      }
    };
    ApiUtil.createFollow(formData);
  },
  unfollowClick: function(id) {
    ApiUtil.destroyFollow(id);
  },
  handleRecordingClick: function (id) {
    this.context.router.push("recordings/" + id);
  },
  render: function() {
    var followed_users;
    var followed_ids = [];
    var current_user;
    var user_profile = this.state.user.id;
    var image;
    var content = "not today Satan";
    var recordings;
    var start_date;
    var buttons;
    var that = this;
    var userPair;
    var follow;

    if (this.state.follow){
      console.log(this.state.follow.id);
      follow = this.state.follow.id;
    }

    if (this.state.currentUser.followed_users){
      this.state.currentUser.followed_users.map( function(user){
        followed_ids.push(user.id);
      });
    }

    if (this.state.user.followed_users){
      followed_users = this.state.user.followed_users.map( function(user){
        return (<li key={user.username}>
                  <a onClick={that.handleFollowedClick.bind(null, user.id)}>
                    {user.username}
                  </a>
                </li>);
      });
    }
    if (this.state.user) {
      userPair = [SessionStore.currentUser().id, this.state.user.id];
      content = <h3>{this.state.user.username}</h3>;
      image = this.state.user.image;
      if (this.state.user.created_at){
      start_date = this.state.user.created_at.substring(0,10);
      }
      if (this.state.user.id === this.state.currentUser.id){
        buttons = <div className="user-buttons">
                    <button onClick={this.editClickHandler.bind(null, user_profile )}
                            className="show-edit-user">Edit Profile</button>
                          <button onClick={this.deleteClickHandler.bind(null, user_profile )}
                            className="show-delete-user">Delete Account</button>
                  </div>;
      } else if (followed_ids.includes(this.state.user.id)) {
        buttons = <div className="user-buttons">
                    <button onClick={this.unfollowClick.bind(null, follow)}>Unfollow</button>
                  </div>;
      } else {
        buttons = <div className="user-buttons">
                    <button onClick={this.followClick.bind(null, userPair)}>Follow</button>
                  </div>;
      }
    }
    if (this.state.user.recordings) {
    recordings = this.state.user.recordings.map( function(recording){
      return (<li key={recording.id}>
                <a onClick={that.handleRecordingClick.bind(null, recording.id)}>
                  {recording.title}
                </a>
              </li>);
      });
    } else {
      recordings = "it isn't working";
    }

    return (
      <div className="content group user-profile">
        <div className="profile-pic">
          <img src={image}/>
          {buttons}
        </div>
        <article className = "profile-info">
          {content}

          <section>
            <h4>Recordings</h4>
            <ul>
              {recordings}
            </ul>
          </section>
          <section>
            <h4>Following</h4>
            <ul>
              {followed_users}
            </ul>
          </section>
          <section>
            <h4> Joined on:</h4>
            <p>{start_date}</p>
          </section>
        </article>

      </div>
    );
  }
});
  module.exports = UserShow;
