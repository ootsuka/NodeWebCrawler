import React, { Component } from 'react';
import {
  BrowserRouter, Switch, Route, Link
} from 'react-router-dom'
import { Layout, Menu, Button } from 'antd';
import './App.css';
import Chart from './components/Chart.js';
import routers from './routers/router';
import history from './routers/history';
const { Header, Content, Footer } = Layout;
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
      <BrowserRouter history={history}>
         <Layout className="layout">
           <Header>
              <h1 style={{float:'left',color:'#fff'}}>
                  Nodejs Webcrawler LianJia
              </h1>
              <Button type="primary" style={{marginLeft:'15px'}} onClick={() => this.handleClick()} loading={loading}>
                  {progress===''?'Crawl Something':progress}
              </Button>
              <Menu
                   theme="dark"
                   mode="horizontal"
                   defaultSelectedKeys={['0']}
                   style={{ lineHeight: '64px', float:'right'}}
              >
               {routers.map(function (route, i) {
                 return (
                   <Menu.Item key={i}>
                      <Link to={route.path}>
                          {route.name}
                      </Link>
                   </Menu.Item>
                 )
               })}
              </Menu>
           </Header>
           <Content style={{ padding: '0 50px' }}>
              <Switch>
                  {routers.map((route, i) => {
                    return <Route key={i} exact path={route.path} component={route.component}/>
                  })}
              </Switch>
           </Content>
           <Footer style={{ textAlign: 'center' }}>
              Webcrawler-lj ©2018 Created by xiaoxin
           </Footer>
         </Layout>
      </BrowserRouter>
    );
  }
}

export default App;
