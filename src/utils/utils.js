const admin = require('firebase-admin')
// Import function to create the message object for the push notifications
const  {createMessageForPushNotification} = require('../messages/messagePushNotifications');
const { findPlayersByRole, toggleIsInsideTowerByEmail, findPlayerByEmail } = require('../database/Player');

async function getPlayerScreen(email, io) {

    console.log("\n========= GET PLAYER CURRENT SCREEN =========");
  
    try {
      const playerData = await findPlayerByEmail(email);
      if (!playerData) {
        throw new Error("Player not found");
      }
      const { socketId } = playerData;
  
      // Return a promise to be able to use await() when calling to this method.
      return new Promise((resolve, reject) => {
        io.timeout(3000).to(socketId).emit("playerScreen", {}, (err, response) => {
  
          if (err) {
            console.error("Error receiving response from client:", err);
            return reject(err);
          }
  
          console.log("Respuesta recibida del cliente:", response[0]);
  
          // Get and return the screen name the player.
          if (response[0]?.success) {
            let { data } = response[0];
            if (data) {
  
              let { route } = data;
              if (route) {
                return resolve(route);  // Resolve the promise
              }
            }
          } else {
            console.log("El cliente respondió con un error:", response.errorMessage);
          }
  
          // If the response do not have a valid screen name, resolve with undefined.
          return resolve(undefined);
  
        });
      });
  
    } catch (error) {
      console.log('Error en getPlayerScreen:', error);
      throw error;
    }
}
  
async function toggleAcolyteInsideTower(email, io, mqttClient) {

    try {
      console.log("\n========= TOOGLE ACOLYTE INSIDE TOWER =========");
  
      if (!email) throw new Error("Email parameter is null or undefined");
  
      let playerCurrentScreen = await getPlayerScreen(email, io);
      let bodyText = '';
      let titleText = '';
  
      // Obtain the Mortimers data
      const mortimers = await findPlayersByRole("MORTIMER");
      console.log("Data from players with role MORTIMER: ");
      console.log(mortimers);
  
      // Obtain the fcm_token from the Mortimer players array to send the push notification
      const fcm_tokens = mortimers.map(mortimer => mortimer.fcm_token);
  
      // Add the text to the message body and title, for the message we want to send on the push notification
      bodyText = 'An acolyte is trying to open the door of The Tower.';
      titleText = 'Something is moving on the tower door!!!';
  
      // Create the message object to modify to send it, with fcm_token to send the message to the correct device/user
      const messageWarningSomeoneIsTryingToEnterTheTower = createMessageForPushNotification(bodyText, titleText, fcm_tokens);
  
      // Send message to mortimer that an acolyte is trying to access
      sendPushNotification(messageWarningSomeoneIsTryingToEnterTheTower);
  
      if (playerCurrentScreen !== "TowerDoorScreen" && playerCurrentScreen !== "Tower Screen") {
        console.log("The player is not in the screen 'TowerDoorScreen' or inside the Tower, so he can not enter or exit the tower.");
        return;
      }
  
      // Await the asynchronous operation to ensure it completes
      const newPlayerData = await toggleIsInsideTowerByEmail(email);
  
      console.log("SocketId: ", newPlayerData.socketId);
  
      // Send confirmation message to the client who scanned the acolyte
      io.to(newPlayerData.socketId).emit("toggleInsideTower", { success: true, playerData: newPlayerData });
  
      console.log('Acolyte has entered or exited the tower successfully');
  
      // Add the text to the message body and title, for the message we want to send on the push notification
      bodyText = 'An acolyte tried to open the door fo The Tower and success.';
      titleText = 'The tower door has been opened!!!';
  
      // Create the message object to modify to send it, with fcm_token to send the message to the correct device/user
      const messageWarningSomeoneSuccessOpeningTheTowerDoor = createMessageForPushNotification(bodyText, titleText, fcm_tokens);
  
      console.log(messageWarningSomeoneSuccessOpeningTheTowerDoor);
  
      // Send message to mortimer that an acolyte failed to open the door
      sendPushNotification(messageWarningSomeoneSuccessOpeningTheTowerDoor);

      // Notify ESP32 that has to open.
      mqttClient.publish('doorAction', JSON.stringify({ action: 'open', email: newPlayerData.email }), (err) => {
        if (err) {
          console.error("Failed to publish 'doorAction' topic:", err);
        } else {
          console.log("Published 'open door' action to MQTT");
        }
      });

    } catch (error) {
      console.log('Error entering the acolyte to tower. Error: ', error);
    }
}


function sendPushNotification(message) {

    admin
      .messaging()
      .sendEachForMulticast(message)
      .then(response => {
        console.log('Successfully sent message:', response);
      })
      .catch(error => {
        console.log('Error sending message:', error);
      });
  }

  module.exports = {
    toggleAcolyteInsideTower,
    sendPushNotification
  }