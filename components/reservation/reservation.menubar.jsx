import React, { Component } from 'react';
import Link from 'next/link';
import { Menu } from 'semantic-ui-react';

export default class ReservationMenubar extends Component {
  render() {
    return (
      <Menu>
        <Link href={'/reservation'} passHref>
          <Menu.Item>예약 대기 목록</Menu.Item>
        </Link>
        <Link href={'/place'} passHref>
          <Menu.Item>장소 목록</Menu.Item>
        </Link>
        <Link href={'/place/reservation'} passHref>
          <Menu.Item>장소 예약</Menu.Item>
        </Link>
        <Link href={'/equipment'} passHref>
          <Menu.Item>장비 목록</Menu.Item>
        </Link>
        <Link href={'/equipment/reservation'} passHref>
          <Menu.Item>장비 예약</Menu.Item>
        </Link>
      </Menu>
    );
  }
}
