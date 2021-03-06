import React from 'react';
import ReactDOM from 'react-dom';
import { Switch } from 'react-router';
import { HashRouter, Route } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';

import HomeView from 'views/HomeView';
import ChronometerView from 'views/ChronometerView';

const GlobalStyle = createGlobalStyle`
    body {
        margin: 0;
        background: rgb(45, 45, 45);
        color: rgb(230, 230, 230);
    }

    a {
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }
`;

export const Root = styled.div`
    @font-face {
        font-family: 'Museo Sans Rounded';
        src: url(./assets/MuseoSansRounded-500-webfont.woff2);
        font-display: swap;
    }

    font-family: Museo Sans Rounded;
    font-size: 30px;
`;

ReactDOM.render(
    <HashRouter>
        <Root>
            <GlobalStyle />
            <Switch>
                <Route path="/chronometer" component={ChronometerView} />
                <Route path="/" component={HomeView} />
            </Switch>
        </Root>
    </HashRouter>,
    document.getElementById('app')
);
