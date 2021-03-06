import { useEffect, useState } from 'react'
import axios from 'axios'
import { Dropdown, Menu } from 'semantic-ui-react'
import { useRouter } from 'next/router'

const MenuItemUser = () => {
  const router = useRouter()
  const [user, setUser] = useState({})

  useEffect(() => {
    axios.get(
      `${process.env.NEXT_PUBLIC_API}/auth/verifyToken`, {
        withCredentials: true,
      }).then(res => setUser(res.data)).catch(() => {
      // Fail to login
      if (process.env.NODE_ENV !== 'development') {
        router.push('/login')
      }
    })
  }, [router])

  const handleLogout = async () => {
    try {
      await axios.get(`${process.env.NEXT_PUBLIC_API}/auth/logout`, {
        withCredentials: true,
      })
      await router.push('/login')
    } catch (err) {
      alert('로그아웃에 실패했습니다.')
      console.log(err)
    }
  }

  return (
    <Menu.Item position={'right'}>
      <Dropdown item simple position={'right'}
                text={`${user.name}`}>
        <Dropdown.Menu style={{
          border: 'none',
          boxShadow: '0 2px 5px 0px rgba(0, 0, 0, 0.2)',
        }}>
          <Dropdown.Item text={'로그아웃'} onClick={handleLogout}/>
        </Dropdown.Menu>
      </Dropdown>
    </Menu.Item>
  )
}

export default MenuItemUser