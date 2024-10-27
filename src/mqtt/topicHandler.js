const { findPlayerByIdCard } = require('../database/Player');

  function subscribe(mqttClient, topic) {
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
        const cardId = cardIdMessage.msg;
        console.log(cardId);

        try {
          // Retrieve player data using the cardId
          const playerData = await findPlayerByIdCard(cardId);
  
          if (playerData) {
            console.log(`Access granted to player: ${playerData.name}`)

            // Publish "open door" message to MQTT topic
            mqttClient.publish('action', JSON.stringify({ action: 'open' }), (err) => {
            if (err) {
              console.error("Failed to publish 'open door' action:", err);
            } else {
              console.log("Published 'open door' action to MQTT");
            }
          });
          } 
          
          else {
            console.log(`Access denied for cardId: ${cardId}`);
          }
        } catch (error) {
          console.error("Error retrieving player data:", error);
        }
      }
    });
  }
  
  module.exports = { subscribe };