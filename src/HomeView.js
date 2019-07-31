import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import { getReadableTime, getLocalStorage, deleteLocalStorage } from './util';

const HISTORY_TIMERS = 'history';

let popup = null;

export default class HomeView extends Component {
    state = { history: [] };

    async componentDidMount() {
        const history = (await getLocalStorage(HISTORY_TIMERS)) || [];
        const historyWithTimes = history.map(timer => ({
            ...timer,
            started: new Date(timer.started).toLocaleString(),
            humanFriendlyFormat: getReadableTime(timer.milliseconds)
        }));
        this.setState({ history: historyWithTimes });
    }

    deleTimer = async index => {
        const updatedHistory = await deleteLocalStorage(index, HISTORY_TIMERS);
        const historyWithTimes = updatedHistory.map(timer => ({
            ...timer,
            started: new Date(timer.started).toLocaleString(),
            humanFriendlyFormat: getReadableTime(timer.milliseconds)
        }));
        this.setState({ history: historyWithTimes });
    };

    handleNewTimer = () => {
        popup = open(
            '#/chronometer',
            null,
            'statusbar=no,height=160,width=260'
        );
    };

    render() {
        console.log(popup);
        return (
            <Root>
                <Button onClick={this.handleNewTimer}>Chronometer</Button>
                <Heading1>Previous Times</Heading1>
                {this.state.history.length === 0
                    ? 'None.'
                    : this.state.history.map((timer, index) => (
                          <Timer key={timer.id}>
                              <TimeDisplay>
                                  <div>{timer.humanFriendlyFormat}</div>
                                  <StartTime>on {timer.started}</StartTime>
                              </TimeDisplay>
                              <DeleteTimer
                                  onClick={() => this.deleTimer(index)}
                              >
                                  <Button>Delete</Button>
                              </DeleteTimer>
                          </Timer>
                      ))}
            </Root>
        );
    }
}

const Root = styled.div`
    font-size: 20px;
    padding: 10px;
`;

const Heading1 = styled.h1`
    margin: 0;
`;

const Timer = styled.div`
    padding: 5px;
    display: flex;
    justify-content: space-between;
`;

const TimeDisplay = styled.div``;

const StartTime = styled.div`
    font-size: 12px;
    color: grey;
`;

const DeleteTimer = styled.div``;

const Button = styled.button`
    margin: 10px;
    margin-left: 0;
`;
