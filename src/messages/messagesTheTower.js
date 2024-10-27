
const messageSomeoneIsTryingToEnter = {

    tokens: [],
    notification: {
        body: 'An acolyte is trying to open the door to access to the tower.',
        title: 'Something is moving on the tower door!!!',
    },
    android: {
        notification: {
        },
    },
};

const messageSomeoneSuccesfullyOpenDoor = {

    tokens: [],
    notification: {
        body: 'An acolyte tried to open the door fo the tower and success.',
        title: 'The tower door is opening!!!',
    },
    android: {
        notification: {
        },
    },
};

const messageSomeoneFailedOpenDoor= {

    tokens: [],
    notification: {
        body: 'An acolyte tried to open the door fo the tower and failed.',
        title: 'The tower door is still closed!!!',
    },
    android: {
        notification: {
        },
    },
};


module.exports = {
    messageSomeoneIsTryingToEnter,
    messageSomeoneFailedOpenDoor,
    messageSomeoneSuccesfullyOpenDoor,
}