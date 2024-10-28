
// Object of the message to send a push notification
class PushMessage {

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

// Function that creates a 'PushMessage' object and it returns
function createMessageForPushNotification(bodyText = '', titleText = '', tokens = []) {
    return (new PushMessage(bodyText, titleText, tokens));
}

// Export the function to create the 'PushMessage' objects
module.exports = {
    createMessageForPushNotification,
}