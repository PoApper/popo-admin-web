import React from 'react';
import Link from 'next/link';
import { Icon, Table } from 'semantic-ui-react';
import _ from 'lodash';

const ownerNames = {
  chonghak: '총학생회',
  dongyeon: '동아리연합회',
  dormUnion: '생활관자치회',
  saengna: '생각나눔',
  others: '그 외',
};
const EquipmentTable = ({ equipmentList }) => {
  const [state, dispatch] = React.useReducer(exampleReducer, {
    column: null,
    data: equipmentList,
    direction: null,
  });
  const { column, data, direction } = state;

  function exampleReducer(state, action) {
    switch (action.type) {
      case 'CHANGE_SORT':
        if (state.column === action.column) {
          return {
            ...state,
            data: state.data.slice().reverse(),
            direction:
              state.direction === 'ascending' ? 'descending' : 'ascending',
          };
        }

        return {
          column: action.column,
          data: _.sortBy(state.data, [action.column]),
          direction: 'ascending',
        };
      default:
        throw new Error();
    }
  }

  return (
    <Table celled selectable sortable textAlign={'center'}>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>idx.</Table.HeaderCell>
          <Table.HeaderCell
            sorted={column === 'name' ? direction : null}
            onClick={() => dispatch({ type: 'CHANGE_SORT', column: 'name' })}
          >
            장비명
          </Table.HeaderCell>
          <Table.HeaderCell
            sorted={column === 'equip_owner' ? direction : null}
            onClick={() =>
              dispatch({ type: 'CHANGE_SORT', column: 'equip_owner' })
            }
          >
            장비 소속
          </Table.HeaderCell>
          <Table.HeaderCell
            sorted={column === 'fee' ? direction : null}
            onClick={() => dispatch({ type: 'CHANGE_SORT', column: 'fee' })}
          >
            대여비
          </Table.HeaderCell>
          <Table.HeaderCell
            sorted={column === 'max_minutes' ? direction : null}
            onClick={() =>
              dispatch({ type: 'CHANGE_SORT', column: 'max_minutes' })
            }
          >
            일일 한도 (분)
          </Table.HeaderCell>
          <Table.HeaderCell
            sorted={column === 'total_reservation_count' ? direction : null}
            onClick={() =>
              dispatch({
                type: 'CHANGE_SORT',
                column: 'total_reservation_count',
              })
            }
          >
            총 예약 개수
          </Table.HeaderCell>
          <Table.HeaderCell></Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {data.map((equipment, idx) => (
          <Table.Row key={equipment.uuid}>
            <Table.Cell>{idx + 1}</Table.Cell>
            <Table.Cell>{equipment.name}</Table.Cell>
            <Table.Cell>{ownerNames[equipment.equip_owner]}</Table.Cell>
            <Table.Cell>{equipment.fee.toLocaleString()}</Table.Cell>
            <Table.Cell>
              {equipment.max_minutes === 1440
                ? '제한 없음'
                : equipment.max_minutes.toLocaleString()}
            </Table.Cell>
            <Table.Cell>
              {equipment.total_reservation_count.toLocaleString()}
            </Table.Cell>
            <Table.Cell>
              <Link href={`/equipment/update/${equipment.uuid}`}>
                <Icon name={'edit'} />
              </Link>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
      <Table.Footer>
        <Table.Row></Table.Row>
      </Table.Footer>
    </Table>
  );
};

export default EquipmentTable;
