
// Object of the message to send a push notification
class PushMessage {

    constructor(bodyText, titleText, tokens, messageTopic, screenToMove) {
        this.tokens = tokens,
            this.notification = {
                body: bodyText,
                title: titleText,
            },
            this.data = {
                topic: messageTopic,
                // screenToMove: screenToMove,
            },
            this.android = {
                notification: {
                },
            }
    }


}

// Function that creates a 'PushMessage' object and it returns
function createMessageForPushNotification(bodyText = '', titleText = '', tokens = [], messageTopic = '', screenToMove = ' ') {
    return (new PushMessage(bodyText, titleText, tokens, messageTopic, screenToMove));
}

// Export the function to create the 'PushMessage' objects
module.exports = {
    createMessageForPushNotification,
}