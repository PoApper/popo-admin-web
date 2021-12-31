import {Input} from "semantic-ui-react";
import axios from "axios";

const UserSearchbar = ({setUsers}) => {
  function handleKeyPress (event) {
    const query = event.target.value;
    console.log(query);
    axios
      .get(`${process.env.NEXT_PUBLIC_API}/user?query=${query}`)
      .then((res) => setUsers(res.data))
      .catch((err) => {
        alert('유저 검색에 실패했습니다.')
        console.log(err)
      })
  }

  return (
    <div>
      <Input
        icon={'search'}
        placeholder={"유저 ID, 이름으로 검색해보세요."}
        onChange={handleKeyPress}
      />
    </div>
  )
}

export default UserSearchbar