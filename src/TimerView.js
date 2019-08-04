import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import {
    getReadableTime,
    getLocalStorage,
    setLocalStorage,
    patchLocalStorage,
    destroyInterval,
    registerServiceWorker,
    requestNotificationPermission,
    timeNotification,
    getHours,
    getMinutes,
    getMinutesOnly,
    getPaddedTime
} from './util';

import CogIcon from './CogIcon';

const ONE_SECOND = 1000;
const TWO_HOURS = 2 * 1000 * 60 * 60;
const TEN_MINUTES = 10 * 1000 * 60 + 10;

const CONFIGURATION = 'config';
const CURRENT_TIMER = 'current';
const HISTORY_TIMERS = 'history';

let timerInterval = null;

export default class TimerView extends Component {
    state = {
        showSettings: false
    };

    async componentDidMount() {
        const config = await this.getConfig();
        this.setState({ ...config });

        const previousTimer = await getLocalStorage(CURRENT_TIMER);
        if (previousTimer) {
            this.startWithPreviousTimer(previousTimer);
        } else {
            this.startTimer();
        }

        registerServiceWorker('./serviceWorker.js');
        await requestNotificationPermission();
    }

    getConfig = async () => {
        return (
            (await getLocalStorage(CONFIGURATION)) || {
                threshold: TWO_HOURS,
                interval: TEN_MINUTES
            }
        );
    };

    startWithPreviousTimer = async previousTimer => {
        if (previousTimer.started) {
            this.startTimer(previousTimer.started);
        } else {
            this.updateTimerWithFixedValue(
                false,
                previousTimer.milliseconds,
                previousTimer.paused
            );
        }
    };

    startTimer = (started = new Date().getTime()) => {
        if (!timerInterval) {
            this.updateTimer(started);
            timerInterval = setInterval(this.updateTimer, ONE_SECOND);
        } else {
            console.warn('The timer was already started.');
        }
    };

    updateTimer = (started = false) => {
        const now = new Date().getTime();
        this.updateTimerWithFixedValue(started, now);
        this.handleSendAlert();
    };

    updateTimerWithFixedValue = (
        started = false,
        value = 0,
        paused = false
    ) => {
        const milliseconds = value - (started || this.state.started || 0);
        const humanReadableTime = getReadableTime(milliseconds);
        this.setState(() => ({
            ...(started && { started }), // set the start time only if the value needs to be updated
            milliseconds,
            ...(paused && { paused }), // set the stop time only if the value needs to be updated
            humanReadableTime
        }));

        patchLocalStorage(
            {
                started: this.state.started,
                ...(started && { started }),
                milliseconds
            },
            CURRENT_TIMER
        );
        this.updateWindowTitle(humanReadableTime);
    };

    updateWindowTitle = humanReadableTime => {
        document.title = humanReadableTime;
    };

    pauseTimer = () => {
        timerInterval = destroyInterval(timerInterval);
        setLocalStorage(
            {
                started: false,
                milliseconds: this.state.milliseconds,
                paused: this.state.started
            },
            CURRENT_TIMER
        );
        this.setState({ started: false, paused: this.state.started });
    };

    resetTimer = () => {
        timerInterval = destroyInterval(timerInterval);
        setLocalStorage(
            {
                started: false,
                milliseconds: 0,
                paused: false
            },
            CURRENT_TIMER
        );

        const humanReadableTime = getReadableTime();
        this.setState({
            started: false,
            milliseconds: 0,
            humanReadableTime,
            paused: false
        });
        this.updateWindowTitle(humanReadableTime);
    };

    saveTimer = () => {
        patchLocalStorage(
            {
                started: this.state.paused,
                milliseconds: this.state.milliseconds
            },
            HISTORY_TIMERS,
            true
        );

        if (window.opener) {
            window.opener.location.reload(false);
        }
    };

    addTime = delta => {
        const now = new Date().getTime();
        const updatedStart = Math.min(
            now,
            new Date(this.state.started - delta).getTime()
        );
        this.setState({ started: updatedStart }, () => this.updateTimer());
    };

    toggleTimerState = () => {
        if (this.state.started) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    };

    handleSendAlert = () => {
        const now = new Date().getTime();
        if (this.state.milliseconds >= TWO_HOURS) {
            if (
                !this.state.alertSent ||
                (this.state.alertSent &&
                    now >= this.state.alertSent + TEN_MINUTES)
            ) {
                const alertSent = timeNotification(
                    TWO_HOURS,
                    this.state.milliseconds - TWO_HOURS
                );

                if (alertSent) {
                    this.setState({ alertSent: now });
                }
            }
        }
    };

    isAboveThreshold = () => {
        return this.state.milliseconds >= TWO_HOURS;
    };

    render() {
        return (
            <Root>
                <Container>
                    <Timer aboveThreshold={this.isAboveThreshold()}>
                        {this.state.humanReadableTime}
                    </Timer>
                    <StartTime>
                        {(this.state.started || this.state.paused) && (
                            <Fragment>
                                Started on{' '}
                                {new Date(
                                    this.state.started || this.state.paused
                                ).toLocaleString()}
                                .
                            </Fragment>
                        )}
                    </StartTime>
                    <div>
                        <Button onClick={this.toggleTimerState}>
                            {this.state.started ? 'Stop' : 'Start'}
                        </Button>
                        <Button onClick={this.resetTimer}>Reset</Button>
                        {!this.state.started && this.state.milliseconds > 0 && (
                            <Button onClick={this.saveTimer}>Save</Button>
                        )}
                    </div>
                    {this.state.started && (
                        <div>
                            <Button onClick={() => this.addTime(TEN_MINUTES)}>
                                +10 min
                            </Button>
                            <Button onClick={() => this.addTime(-TEN_MINUTES)}>
                                -10 min
                            </Button>
                        </div>
                    )}
                    {this.state.showSettings && (
                        <Fragment>
                            <hr />
                            <Setting first>
                                <div>Send notifications after </div>
                                <TimeInput
                                    type="number"
                                    value={getHours(this.state.threshold)}
                                />{' '}
                                hours{' '}
                                <TimeInput
                                    type="number"
                                    value={getPaddedTime(
                                        getMinutes(this.state.threshold)
                                    )}
                                />{' '}
                                minutes.
                            </Setting>
                            <Setting>
                                <div>Send a notification every </div>
                                <TimeInput
                                    type="number"
                                    value={getMinutesOnly(this.state.interval)}
                                />{' '}
                                minutes.
                            </Setting>
                        </Fragment>
                    )}
                </Container>
                <Extra>
                    <SettingToggle
                        onClick={() =>
                            this.setState({
                                showSettings: !this.state.showSettings
                            })
                        }
                    >
                        <CogIcon />
                    </SettingToggle>
                    <Link to="/" target="_blank">
                        Dashboard >
                    </Link>
                </Extra>
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

const Container = styled.div`
    margin-top: 10px;
    width: 200px;
    background: #ebf1f2;
    padding: 20px;
    border-radius: 10px;
    border: 1px solid #909fa5;
`;

const Timer = styled.div`
    color: ${props => (props.aboveThreshold ? 'red' : null)};
`;

const StartTime = styled.div`
    min-height: 20px;
    font-size: 12px;
    color: ${props => (props.aboveThreshold ? 'red' : 'grey')};
    margin-bottom: 10px;
`;

const Button = styled.button`
    cursor: pointer;
`;

const Setting = styled.div`
    ${props => (props.first ? null : 'margin-top: 15px;')}
    font-size: 14px;
`;

const TimeInput = styled.input`
    width: 35px;
`;

const Extra = styled.div`
    width: 240px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
    margin-bottom: 10px;
    font-size: 14px;
`;

const SettingToggle = styled.div`
    height: 15px;
    width: 15px;
    cursor: pointer;
`;
