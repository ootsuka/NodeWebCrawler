import React, { Component } from 'react';
import { Button } from 'antd';
import './App.css';

const io = require('socket.io-client');
const socket = io.connect('http://localhost:3000/',{'forceNew':true});

class App extends Component {
  state = {
      loading: false,
      progress: '',
  };

  handleClick = () => {
    console.log('got crawling request');
    socket.emit('request', 'got crawling request...');
    socket.on('progress', function (data) {
      this.setState({
        loading: true,
        progress: data.progress
      });
      if (data.progress === 'finished') {
        this.setState({
          loading: false
        })
      }
    }.bind(this));
  };

  render() {
    const { loading, progress } = this.state
    return (

      <div className="App">
      <h1>Nodejs-LianJia</h1>
        <div>
          <Button onClick={this.handleClick.bind(this)} loading={loading}>
          {progress===''?'Go Crawl Something':progress}
          </Button>
        </div>
      </div>
    );
  }
}

export default App;
