const { findPlayerByIdCard, findPlayersByRole } = require('../database/Player');
const { storeAccessToken } = require('../database/Token');
const { toggleAcolyteInsideTower, sendPushNotification, getPlayerScreen } = require('../utils/utils');
const  {createMessageForPushNotification} = require('../messages/messagePushNotifications');

  function handleIdCardAccess(io, mqttClient) {

    const topic = 'cardId';

    mqttClient.subscribe(topic, (err) => {
      if (err) {
        console.error(`Failed to subscribe to topic ${topic}:`, err);
      } else {
        console.log(`Subscribed to topic: ${topic}`);
      }
    });
  
    // Listen for messages on the subscribed topic
    mqttClient.on('message', async (receivedTopic, message) => {
      if (receivedTopic === topic) {
        const cardIdMessage = JSON.parse(message.toString());
        console.log(cardIdMessage);
        const cardId = cardIdMessage.cardId;
        console.log(cardId);

        try {
          
          // Retrieve player data using the cardId
          const playerData = await findPlayerByIdCard(cardId);
          // console.log(playerData);
          
          if (playerData ) {

              const playerCurrentScreen = await getPlayerScreen(playerData.email, io);
              console.log("playerCurrentScreen");
              console.log(playerCurrentScreen);

              if (playerCurrentScreen !== "TowerDoorScreen" && playerCurrentScreen !== "Tower Screen") {
                console.log("The player is not in the screen 'TowerDoorScreen' or inside the Tower, so he can not enter or exit the tower.");
                return;
              }

              // Generate a temporary access token
              const accessToken = crypto.randomUUID();
              
              // Store token and email association in MonogDB
              await storeAccessToken(accessToken, playerData.email);

              // Notify ESP32 that has to open.
              mqttClient.publish('doorAction', JSON.stringify({ action: 'open', token: accessToken}), (err) => {
                if (err) {
                  console.error("Failed to publish 'doorAction' topic:", err);
                } else {
                  console.log("Published 'open door' action to MQTT");
                }
              });
          }  else {
            console.log(`Access denied for cardId: ${cardId}`);
          
            mqttClient.publish('doorAction', JSON.stringify({ action: 'error' }), (err) => {
              if (err) {
                console.error("Failed to publish 'doorAction' topic:", err);
              } else {
                console.log("Published 'doorAction' action to MQTT");
              }
            });

            // PUSH to mortymer "acolyte didnt enter"
            bodyText = 'Someone has tried to enter the tower. The access have been denied.';
            titleText = 'Tower access denied';
        
            // Obtain the fcm_token from the Mortimer players array to send the push notification
            const mortimers = await findPlayersByRole("MORTIMER");
            const fcm_tokens = mortimers.map(mortimer => mortimer.fcm_token);

            // Create the message object to modify to send it, with fcm_token to send the message to the correct device/user
            const messageDeniedAccess = createMessageForPushNotification(bodyText, titleText, fcm_tokens);
            sendPushNotification(messageDeniedAccess);
          }
        } catch (error) {
          console.error("Error retrieving player data:", error);
        }
      }
    });
  }
  
  module.exports = { handleIdCardAccess };