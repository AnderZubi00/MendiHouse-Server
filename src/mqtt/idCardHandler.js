const { findPlayerByIdCard, findPlayersByRole } = require('../database/Player');
const { storeAccessToken } = require('../database/Token');
const { toggleAcolyteInsideTower, sendPushNotification, getPlayerScreen, isPlayerInsideTowerScreens } = require('../utils/utils');
const  {createMessageForPushNotification} = require('../messages/messagePushNotifications');

  function handleIdCardAccess(io, mqttClient) {

    const topic = 'MendiHouse/cardId';

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
        console.log("mensaje puro: " + message);
        const cardId = message;
        console.log(cardId);

        try {
          
          // Retrieve player data using the cardId
          const playerData = await findPlayerByIdCard(cardId);
          // console.log(playerData);
          
          if (playerData ) {

            let isPlayerInsideTowerScreensBool = await isPlayerInsideTowerScreens(playerData.email, mqttClient, io); 
            if (!isPlayerInsideTowerScreensBool) return;

            // Generate a temporary access token
            const accessToken = crypto.randomUUID();
            
            // Store token and email association in MonogDB
            await storeAccessToken(accessToken, playerData.email);
            
            console.log("Opening door");
            
            // Notify ESP32 that has to open.
            mqttClient.publish('MendiHouse/doorAction', JSON.stringify({ action: 'open', token: accessToken}), (err) => {
              if (err) {
                console.error("Failed to publish 'doorAction' topic:", err);
              } else {
                console.log("Published. TOPIC: ['doorAction'] PAYLOAD: { action: 'open', token: accessToken} ");
              }
            });

          }  else {
            console.log(`Access denied for cardId: ${cardId}`);
          
            mqttClient.publish('MendiHouse/doorAction', JSON.stringify({ action: 'error' }), (err) => {
              if (err) {
                console.error("Failed to publish 'doorAction' topic:", err);
              } else {
                console.log("Published. TOPIC: ['doorAction'] PAYLOAD: { action: 'error' }");
              }
            });

            // PUSH to mortymer "acolyte didnt enter"
            bodyText = 'Someone has tried to enter the tower. The access have been denied.';
            titleText = 'Tower access denied';
        
            // Obtain the fcm_token from the Mortimer players array to send the push notification
            const mortimers = await findPlayersByRole("MORTIMER");
            const fcm_tokens = mortimers.map(mortimer => mortimer.fcm_token);
            const unique_fcm_tokens = [...new Set(fcm_tokens)];

            // Create the message object to modify to send it, with fcm_token to send the message to the correct device/user
            const messageDeniedAccess = createMessageForPushNotification(bodyText, titleText, unique_fcm_tokens);
            sendPushNotification(messageDeniedAccess);
          }
        } catch (error) {
          console.error("Error retrieving player data:", error);
        }
      }
    });
  }
  
  module.exports = { handleIdCardAccess };