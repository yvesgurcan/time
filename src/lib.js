import uuid4 from 'uuid/v4';

const APP_KEY = 'yog-chronos';

const GRANTED = 'granted';

const FIVE_MINUTES = 5 * 1000 * 60;

// 37 characters maximum per message
const MESSAGES = [
    "Let's get up and stretch. 🙂",
    'Feeling hungry? Eat a bite. 🥗',
    'Send a message to somebody. 📱',
    'When did you last drink water? 🚰',
    'Time for a bike ride! 🚴‍♂️',
    'Too much time looking at a screen! 🤓',
    'What else could you be doing today? 🔌',
    'Give your brain a break. 💭',
    'Is this making you feel anxious? 😰',
    'Be nice to yourself. 🌻',
    'How about something different? 🏡',
    'Spend a few minutes on a chore. 🥄',
    "There's always tomorrow. ☀️",
    "What's going on outside? 🚊",
    'Did you plan something else today? 🎭',
    'Can this wait 10 minutes? ⏳',
    'Time for a nap! 💤',
    "That's enough! ✨"
];

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
        await localStorage.setItem(
            `${APP_KEY}-${key}`,
            JSON.stringify([{ ...payload, id }, ...(previous || [])])
        );
    } else {
        await localStorage.setItem(
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
    const title = getuserFriendlyTime(threshold + offset, '+', true);

    const message = getRandomMessage();
    const body = `${
        offset < FIVE_MINUTES ? 'Time to take a break! 🎉' : message
    }`;

    return displayNotification({
        title,
        options: { body, requireInteraction: true }
    });
};

const getRandomMessage = () => {
    const min = Math.ceil(0);
    const max = Math.floor(MESSAGES.length);
    const index = Math.floor(Math.random() * (max - min)) + min;
    return MESSAGES[index];
};
