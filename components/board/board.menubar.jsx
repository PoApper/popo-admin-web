import React, { Component } from 'react';
import Link from 'next/link';
import { Menu } from 'semantic-ui-react';

export default class BoardMenubar extends Component {
  render() {
    return (
      <Menu>
        <Link href={'/board/setting'} passHref>
          <Menu.Item>POPO 설정값</Menu.Item>
        </Link>
        <Link href={'/board/notice'} passHref>
          <Menu.Item>공지사항</Menu.Item>
        </Link>
        <Menu.Item href={'/board/rc-students-list'} passHref>
          RC 사생 명단 업로드
        </Menu.Item>
        <Link href={'/board/whitebook'} passHref>
          <Menu.Item>생활백서</Menu.Item>
        </Link>
        <Menu.Item href={'/board/benefit'} passHref>
          총학 제휴/할인 업체
        </Menu.Item>
      </Menu>
    );
  }
}
