const APP_KEY = 'yog-timer';

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

    return `${hours} h ${minutes} min`;
};

export const getPaddedTime = time => {
    return ('00' + time).slice(-2);
};

export const getLocalStorage = async () => {
    let result = {};
    try {
        let stringifiedResult = localStorage.getItem(APP_KEY);
        result = await JSON.parse(stringifiedResult);
    } catch (exception) {
        console.error({ exception });
    }
    return result;
};

export const setLocalStorage = payload => {
    localStorage.setItem(APP_KEY, JSON.stringify(payload));
};

export const patchLocalStorage = async payload => {
    const previous = await getLocalStorage();
    localStorage.setItem(APP_KEY, JSON.stringify({ ...previous, ...payload }));
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
