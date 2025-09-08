import React from 'react';
import Link from 'next/link';
import { Icon, Table } from 'semantic-ui-react';
import _ from 'lodash';

const regionNames = {
  STUDENT_HALL: '학생 회관',
  JIGOK_CENTER: '지곡 회관',
  COMMUNITY_CENTER: '커뮤니티 센터',
  RESIDENTIAL_COLLEGE: 'RC',
  OTHERS: 'OTHERS',
};

const PlaceTable = ({ placeList }) => {
  const [state, dispatch] = React.useReducer(exampleReducer, {
    column: null,
    data: placeList,
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
            장소명
          </Table.HeaderCell>
          <Table.HeaderCell
            sorted={column === 'location' ? direction : null}
            onClick={() =>
              dispatch({ type: 'CHANGE_SORT', column: 'location' })
            }
          >
            위치
          </Table.HeaderCell>
          <Table.HeaderCell
            sorted={column === 'region' ? direction : null}
            onClick={() => dispatch({ type: 'CHANGE_SORT', column: 'region' })}
          >
            지역
          </Table.HeaderCell>
          <Table.HeaderCell
            sorted={column === 'maxMinutes' ? direction : null}
            onClick={() =>
              dispatch({ type: 'CHANGE_SORT', column: 'maxMinutes' })
            }
          >
            일일 한도 (분)
          </Table.HeaderCell>
          <Table.HeaderCell
            sorted={column === 'totalReservationCount' ? direction : null}
            onClick={() =>
              dispatch({
                type: 'CHANGE_SORT',
                column: 'totalReservationCount',
              })
            }
          >
            총 예약 개수
          </Table.HeaderCell>
          <Table.HeaderCell></Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {data.map((place, idx) => (
          <Table.Row key={place.uuid}>
            <Table.Cell>{idx + 1}</Table.Cell>
            <Table.Cell>{place.name}</Table.Cell>
            <Table.Cell>{place.location}</Table.Cell>
            <Table.Cell>{regionNames[place.region]}</Table.Cell>
            <Table.Cell>
              {place.maxMinutes === 1440
                ? '제한 없음'
                : place.maxMinutes.toLocaleString()}
            </Table.Cell>
            <Table.Cell>
              {place.totalReservationCount.toLocaleString()}
            </Table.Cell>
            <Table.Cell>
              <Link href={`place/update/${place.uuid}`}>
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

export default PlaceTable;
