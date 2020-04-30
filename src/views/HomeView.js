import React, { Component } from 'react';
import styled from 'styled-components';
import Chronometer from '../components/Chronometer';
import { getReadableTime, getLocalStorage, deleteLocalStorage } from '../util';

const HISTORY_TIMERS = 'history';

export default class HomeView extends Component {
    state = { history: [] };

    async componentDidMount() {
        const history = await this.getTimers();
        this.setState({ history });
    }

    parseTimerDate = timer => {
        const dateObject = new Date(timer.started);
        const year = dateObject.getFullYear();
        const month = dateObject.getMonth() + 1;
        const date = dateObject.getDate();
        const formattedDate = `${year}-${month}-${date}`;

        return formattedDate;
    };

    getTimers = async () => {
        const history = (await getLocalStorage(HISTORY_TIMERS)) || [];

        const historyWithTimes = history.map(timer => ({
            ...timer,
            started: new Date(timer.started).toLocaleString(),
            humanFriendlyFormat: getReadableTime(timer.milliseconds)
        }));

        const groupedTimes = {};
        historyWithTimes.forEach(history => {
            const date = this.parseTimerDate(history);
            if (groupedTimes[date]) {
                groupedTimes[date].push(history);
                return;
            }

            groupedTimes[date] = [history];
        });

        return groupedTimes;
    };

    deleTimer = async index => {
        const updatedHistory = await deleteLocalStorage(index, HISTORY_TIMERS);

        const historyWithTimes = updatedHistory.map(timer => ({
            ...timer,
            started: new Date(timer.started).toLocaleString(),
            humanFriendlyFormat: getReadableTime(timer.milliseconds)
        }));

        const groupedTimes = {};
        historyWithTimes.forEach(history => {
            const date = this.parseTimerDate(history);
            if (groupedTimes[date]) {
                groupedTimes[date].push(history);
                return;
            }

            groupedTimes[date] = [history];
        });

        this.setState({ history: groupedTimes });
    };

    handleNewTimer = () => {
        open('#/chronometer', null, 'statusbar=no,height=210,width=260');
    };

    handleSaveTimer = async () => {
        const history = await this.getTimers();
        this.setState({ history });
    };

    renderParsedTimes = () => {
        if (this.state.history.length === 0) {
            return 'None.';
        }

        let timerComponents = [];
        Object.keys(this.state.history).forEach((day, index) => {
            const timers = this.state.history[day];
            let dayComponent = [];
            dayComponent.push(
                <Heading2>{new Date(day).toLocaleDateString()}</Heading2>
            );
            timers.forEach(timer => {
                dayComponent.push(
                    <Timer key={timer.id}>
                        <TimeDisplay>
                            <div>{timer.humanFriendlyFormat}</div>
                            <StartTime>
                                at{' '}
                                {new Date(timer.started).toLocaleTimeString()}
                            </StartTime>
                        </TimeDisplay>
                        <DeleteTimer onClick={() => this.deleTimer(index)}>
                            <Button>Delete</Button>
                        </DeleteTimer>
                    </Timer>
                );
            });
            timerComponents.push(<div key={day}>{dayComponent}</div>)
        });

        return timerComponents;
    };

    render() {
        return (
            <Root>
                <Section>
                    <Chronometer
                        popup={false}
                        handleSaveTimer={this.handleSaveTimer}
                    />
                    <Button onClick={this.handleNewTimer}>
                        Open in separate window
                    </Button>
                </Section>
                <Section>
                    <Heading1>Previous Times</Heading1>
                    <History>{this.renderParsedTimes()}</History>
                </Section>
            </Root>
        );
    }
}

const Root = styled.div`
    font-size: 20px;
    padding: 10px;
    display: flex;
    flex-wrap: wrap;
`;

const Section = styled.div`
    margin: 10px;
`;

const Heading1 = styled.h1`
    margin: 0;
`;

const Heading2 = styled.h2`
    margin: 0;
    margin-top: 10px;
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

const History = styled.div`
    display: flex;
    flex-wrap: wrap;
`;
