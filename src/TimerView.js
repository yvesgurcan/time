import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import { getReadableTime } from './util';

const APP_KEY = 'yog-timer';

const ONE_SECOND = 1000;

const ALMOST_TWO_HOURS = 1.9999 * 1000 * 60 * 60;

let timerInterval = null;

export default class TimerView extends Component {
    state = {};

    componentDidMount() {
        this.startTimer(ALMOST_TWO_HOURS);
    }

    startTimer = (offset = 0) => {
        const started = new Date().getTime() - offset;
        this.updateTimer(started);
        timerInterval = setInterval(this.updateTimer, ONE_SECOND);
    };

    stopTimer = () => {
        clearInterval(timerInterval);
        this.setState({ started: false });
    };

    updateTimer = (started = 0) => {
        const now = new Date().getTime();
        const milliseconds = now - (started || this.state.started);
        const humanReadableTime = getReadableTime(milliseconds);
        this.setState(() => ({
            ...(started && { started }),
            milliseconds,
            humanReadableTime
        }));
        this.updateWindowTitle(humanReadableTime);
    };

    updateWindowTitle = humanReadableTime => {
        document.title = humanReadableTime;
    };

    getLocalStorage = () => {
        return localStorage.getItem(APP_KEY);
    };

    updateLocalStorage = payload => {
        localStorage.setItem(APP_KEY, payload);
    };

    toggleTimerState = () => {
        if (this.state.started) {
            this.stopTimer();
        } else {
            this.startTimer();
        }
    };

    render() {
        return (
            <Fragment>
                <div>{this.state.humanReadableTime}</div>
                <StartButton onClick={this.toggleTimerState}>
                    {this.state.started ? 'Stop' : 'Start'}
                </StartButton>
            </Fragment>
        );
    }
}

const StartButton = styled.button``;
