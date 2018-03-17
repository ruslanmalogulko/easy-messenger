import React, { Component } from 'react';
import io from 'socket.io-client';
import { Button, TextField, Grid, Hidden, Paper, AppBar, Toolbar, Typography, Chip, Avatar, IconButton,
List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction } from 'material-ui';
import { Message, Delete } from 'material-ui-icons';
import './App.css';

const TYPES = {
    message: 'chat message',
    indicationStart: 'input indicator start',
    indicationStop: 'input indicator stop',
    nickChange: 'nick change',
    sendMessages: 'send messages'
}

class App extends Component {

  static defaultState = {
    message: '',
    messages: [],
    nick: '',
    progress: false,
    progressBy: '',
    activeUsers: {}
  }

  constructor(props) {
      super(props);
      this.state = App.defaultState;
      this.socket = io();
      this.item = null;
      this.onSubmit = this.onSubmit.bind(this);
      this.onChange = this.onChange.bind(this);
      this.onChangeNick = this.onChangeNick.bind(this);
      this.handleDelete = this.handleDelete.bind(this);
  }

  onChange(e) {
    this.setState({message: e.target.value});
    this.socket.emit(TYPES.indicationStart, this.state.nick);
  }

  onChangeNick(e) {
    this.setState({nick: e.target.value});
    this.socket.emit(TYPES.nickChange, e.target.value);
  }

  onSubmit(e) {
    e.preventDefault();
    const {message, nick, messages} = this.state;

    this.socket.emit(TYPES.message, {
      nick, message
    });

    this.setState({
      message: '',
      messages: [...messages, `${nick}: ${message}`]
    });
  }

  handleDelete(idx) {
    const messages = this.state.messages;
    messages.splice(idx, 1);
    this.setState({messages});
  }

  componentDidMount() {
      this.socket.on(TYPES.message, (message) => {
          let newMessages = this.state.messages;
          newMessages.push(`${message.nick}: ${message.message}`);
          this.setState({ messages: newMessages });
      });

      this.socket.on(TYPES.indicationStart, (nick) => {
          this.setState({progress: true, progressBy: nick});
      });

      this.socket.on(TYPES.indicationStop, () => {
          this.setState({progress: false, progressBy: ''});
      });

      this.socket.on(TYPES.nickChange, (activeUsers) => {
          this.setState({ activeUsers });
      });

      this.socket.on(TYPES.sendMessages, (messages) => {
          this.setState({ messages: messages.map(item => `${item.user}: ${item.message}`) });
      })
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
            <AppBar>
              <Toolbar>
                <Typography variant="title" color="inherit">
                    <h2>
                        {this.state.progress ?
                         `${this.state.progressBy} typing...` :
                         'Chat'}
                    </h2>
                </Typography>
              </Toolbar>
            </AppBar>
        </div>
        <p className="App-intro">
          <form onSubmit={this.onSubmit}>
            <Grid container spacing={24}>
              <Grid item xs={12}>
                  {Object.keys(this.state.activeUsers).length ?
                   Object.values(this.state.activeUsers).map(user => (
                  <Chip
                    className="user-chip"
                    avatar={<Avatar>{user[0]}</Avatar>}
                    label={user}
                  />
                )) : <Chip label="No active users" />}
              </Grid>
              <Grid item xs={12} sm={3}>
                  <TextField
                      fullWidth
                      className="nick"
                      label="Name"
                      placeholder="Enter your name"
                      value={this.state.nick}
                      onChange={this.onChangeNick}
                      id="nick"
                      autocomplete="off"
                  />
              </Grid>
              <Grid item xs={12} sm={9}>
                  <TextField
                      fullWidth
                      className="message"
                      label="Message"
                      placeholder="Enter your message"
                      value={this.state.message}
                      onChange={this.onChange}
                      id="m"
                      autocomplete="off"
                  />
              </Grid>
              <Hidden xsDown>
                <Grid item xs={3}></Grid>
              </Hidden>
              <Grid item xs={12} sm={6}>
                  <Button
                      type="Submit"
                      fullWidth
                      color="primary"
                      variant="raised"
                  >
                      Send
                  </Button>
              </Grid>
            </Grid>
          </form>
          <ul id="messages">
            <List>
                {!!this.state.messages &&
                 this.state.messages.map((message, idx) => (
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <Message />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={message}
                    />
                    <ListItemSecondaryAction>
                        <IconButton
                            aria-label="Delete"
                            onClick={() => this.handleDelete(idx)}
                        >
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
          </ul>
        </p>
      </div>
    );
  }
}

export default App;
