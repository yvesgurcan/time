import uuid4 from 'uuid/v4';

const APP_KEY = 'yog-chronos';

const GRANTED = 'granted';

const FIVE_MINUTES = 5 * 1000 * 60;

let serviceWorkerRegistration = null;

export const getReadableTime = (milliseconds = 0) => {
    const seconds = Math.floor((milliseconds / 1000) % 60);
    const minutes = Math.floor(milliseconds / (1000 * 60)) % 60;
    const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);

    return `${getPaddedTime(hours)}:${getPaddedTime(minutes)}:${getPaddedTime(
        seconds
    )}`;
};

export const getuserFriendlyTime = (milliseconds, fudge, roundUpMinutes) => {
    let minutes = 0;
    if (roundUpMinutes) {
        minutes =
            Math.ceil(Math.floor(milliseconds / (1000 * 60) / 5) * 5) % 60;
    } else {
        minutes = Math.floor(milliseconds / (1000 * 60)) % 60;
    }

    const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);

    if (hours && !minutes) {
        if (hours === 1) {
            return `${hours}${fudge} hr`;
        }
        return `${hours}${fudge} hrs`;
    }

    if (!hours && minutes) {
        return `${minutes}${fudge} min`;
    }

    return `${hours} h ${getPaddedTime(minutes)} min`;
};

export const getPaddedTime = time => {
    return ('00' + time).slice(-2);
};

export const getHours = milliseconds => {
    return Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
};

export const getMinutes = milliseconds => {
    return getMinutesOnly(milliseconds) % 60;
};

export const getMinutesOnly = milliseconds => {
    return Math.floor(milliseconds / (1000 * 60));
};

export const getLocalStorage = async key => {
    let result = {};
    try {
        let stringifiedResult = localStorage.getItem(`${APP_KEY}-${key}`);
        result = await JSON.parse(stringifiedResult);
    } catch (exception) {
        console.error({ exception });
    }
    return result;
};

export const setLocalStorage = (payload, key) => {
    localStorage.setItem(`${APP_KEY}-${key}`, JSON.stringify(payload));
};

export const patchLocalStorage = async (payload, key, array = false) => {
    const previous = await getLocalStorage(key);
    if (array) {
        const id = uuid4();
        localStorage.setItem(
            `${APP_KEY}-${key}`,
            JSON.stringify([{ ...payload, id }, ...(previous || [])])
        );
    } else {
        localStorage.setItem(
            `${APP_KEY}-${key}`,
            JSON.stringify({ ...previous, ...payload })
        );
    }
};

export const deleteLocalStorage = async (index, key) => {
    const previous = await getLocalStorage(key);
    const newArray = [
        ...previous.slice(0, index),
        ...previous.slice(index + 1)
    ];
    localStorage.setItem(`${APP_KEY}-${key}`, JSON.stringify([...newArray]));
    return newArray;
};

export const destroyInterval = interval => {
    clearInterval(interval);
    return null;
};

export const registerServiceWorker = url => {
    if (navigator.serviceWorker && PushManager) {
        navigator.serviceWorker
            .register(url)
            .then(reg => {
                console.log('Service Worker is registered', reg);

                serviceWorkerRegistration = reg;
            })
            .catch(exception => {
                console.error('Service Worker error', exception);
            });
    }
};

export const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    // value of permission can be 'granted', 'default', 'denied'
    // granted: user has accepted the request
    // default: user has dismissed the notification permission popup by clicking on x
    // denied: user has denied the request.
    return permission;
};

export const displayNotification = notification => {
    if (serviceWorkerRegistration && Notification.permission === GRANTED) {
        serviceWorkerRegistration.showNotification(
            notification.title,
            notification.options
        );
        return true;
    }

    return false;
};

export const timeNotification = (threshold, offset) => {
    const title = `${getuserFriendlyTime(threshold, '+')} of work. ${
        offset < FIVE_MINUTES ? 'Take a break! 🥳' : 'Time to take a break!'
    }`;

    let body = '';
    if (offset >= FIVE_MINUTES * 2) {
        body = `Your pause is ${getuserFriendlyTime(
            offset,
            '',
            true
        )} overdue 😟`;
    }

    return displayNotification({
        title,
        options: { body, requireInteraction: true }
    });
};
