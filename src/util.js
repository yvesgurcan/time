export const getReadableTime = milliseconds => {
    const seconds = Math.floor((milliseconds / 1000) % 60);
    const minutes = Math.floor(milliseconds / (1000 * 60)) % 60;
    const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);

    return `${getPaddedTime(hours)}:${getPaddedTime(minutes)}:${getPaddedTime(
        seconds
    )}`;
};

export const getPaddedTime = time => {
    return ('00' + time).slice(-2);
};
