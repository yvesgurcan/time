import React, { Component } from 'react';
import styled from 'styled-components';

import Chronometer from '../components/Chronometer';

export default class ChronometerView extends Component {
    render() {
        return (
            <Root>
                <Chronometer />
            </Root>
        );
    }
}

const Root = styled.div`
    min-width: 100vw;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
`;
