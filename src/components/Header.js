import React, { Component } from 'react';
import { Menu, Icon } from 'antd';

export default class Header extends Component{
  render() {
    return (
      <div>
      <h1>LianJia Node.js Webcrawler</h1>
      <Menu mode="horizontal">
       <Menu.Item>Home
       </Menu.Item>
       <Menu.Item>
        Charts
      </Menu.Item>
      </Menu>
      </div>
    )
  }
}
