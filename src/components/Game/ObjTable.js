import React, {useRef} from 'react';

import {Table, Header, Container, Divider, Icon } from 'semantic-ui-react';





class ObjTable extends React.Component {



    render() {
        return (
            <Table id="objectAttrTable" celled singleLine compact sortable selectable >
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>object #</Table.HeaderCell>
                        <Table.HeaderCell>x</Table.HeaderCell>
                        <Table.HeaderCell>y</Table.HeaderCell>
                        <Table.HeaderCell>dx</Table.HeaderCell>
                        <Table.HeaderCell>dy</Table.HeaderCell>
                        <Table.HeaderCell>mass</Table.HeaderCell>
                        <Table.HeaderCell>radius</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                
            </Table>
        );
        
    }
}
