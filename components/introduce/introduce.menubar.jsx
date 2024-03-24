import React, { Component } from 'react';
import Link from 'next/link';
import { Menu } from 'semantic-ui-react';

export default class IntroduceMenubar extends Component {
  render() {
    return (
      <Menu>
        <Link href={'/introduce/association'} passHref>
          <Menu.Item>자치단체 소개글</Menu.Item>
        </Link>
        <Link href={'/introduce/club'} passHref>
          <Menu.Item>동아리 소개글</Menu.Item>
        </Link>
      </Menu>
    );
  }
}
