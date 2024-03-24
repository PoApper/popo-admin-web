import { useEffect, useState } from 'react';
import { Dropdown, Menu } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import { PoPoAxios } from '@/utils/axios.instance';

const MenuItemUser = () => {
  const router = useRouter();
  const [user, setUser] = useState({});

  useEffect(() => {
    PoPoAxios.get('/auth/verifyToken', {
      withCredentials: true,
    })
      .then((res) => setUser(res.data))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await PoPoAxios.get('/auth/logout', {
        withCredentials: true,
      });
      await router.push('/login');
    } catch (err) {
      alert('로그아웃에 실패했습니다.');
      console.log(err);
    }
  };

  return (
    <Menu.Item position={'right'}>
      <Dropdown item simple position={'right'} text={`${user.name}`}>
        <Dropdown.Menu
          style={{
            border: 'none',
            boxShadow: '0 2px 5px 0px rgba(0, 0, 0, 0.2)',
          }}
        >
          <Dropdown.Item text={'로그아웃'} onClick={handleLogout} />
          <Dropdown.Item
            text={`popo-${process.env.NEXT_PUBLIC_POPO_VERSION}`}
          />
        </Dropdown.Menu>
      </Dropdown>
    </Menu.Item>
  );
};

export default MenuItemUser;
