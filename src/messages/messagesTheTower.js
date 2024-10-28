

class Message {

    constructor(bodyText, titleText, tokens) {
        this.tokens = tokens,
            this.notification = {
                body: bodyText,
                title: titleText,
            },
            this.android = {
                notification: {
                },
            }
    }


}

function createMessageForPushNotification(bodyText = '', titleText = '', tokens = []) {
    return (new Message(bodyText, titleText, tokens));
}


module.exports = {
    createMessageForPushNotification,
}