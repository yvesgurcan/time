import React from 'react';
import ReactDOM from 'react-dom';
import { Switch } from 'react-router';
import { HashRouter, Route } from 'react-router-dom';
import styled from 'styled-components';

import TimerView from './TimerView';

export const Root = styled.div`
    @font-face {
        font-family: 'Museo Sans Rounded';
        src: url(./assets/MuseoSansRounded-500-webfont.woff2);
    }

    font-family: Museo Sans Rounded;
    font-size: 30px;
`;

ReactDOM.render(
    <HashRouter>
        <Root>
            <Switch>
                <Route path="/" component={TimerView} />
            </Switch>
        </Root>
    </HashRouter>,
    document.getElementById('app')
);
