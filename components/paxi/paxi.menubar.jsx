import React, { Component } from 'react';
import Link from 'next/link';
import { Menu } from 'semantic-ui-react';

export default class PaxiMenubar extends Component {
  render() {
    return (
      <Menu>
        <Link href={'/paxi'} passHref>
          <Menu.Item>카풀 방 내역</Menu.Item>
        </Link>
        <Link href={'/paxi/reports'} passHref>
          <Menu.Item>신고 처리</Menu.Item>
        </Link>
      </Menu>
    );
  }
}
