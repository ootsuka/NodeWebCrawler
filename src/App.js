import React, { Component } from 'react';
import { Button } from 'antd';
import './App.css';

class App extends Component {
  state = {
      loading: false,
      progress: '',
  };

  handleClick = () => {
    console.log('Button Clicked');
    this.setState({
      loading: true,
      progress: 'getting there'
    })
    setTimeout(function () {
      this.setState({
        loading: false,
        progress: 'Succeeded Crawling Awesome Things'
      })
    }.bind(this), 3000)
  };

  render() {
    const { loading, progress } = this.state
    return (
      <div className="App">
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
