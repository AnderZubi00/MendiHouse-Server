function subscribe(mqttClient, topic) {
    mqttClient.subscribe(topic, (err) => {
      if (err) {
        console.error(`Failed to subscribe to topic ${topic}:`, err);
      } else {
        console.log(`Successfully subscribed to topic: ${topic}`);
      }
    });
  
    // Handle incoming MQTT messages as part of a subscription to an MQTT topic.
    mqttClient.on('message', (receivedTopic, message) => {
      if (receivedTopic === topic) {
        console.log(`Received message on ${topic}: ${message.toString()}`);
      }
    });
  }
  
  function publish(mqttClient, topic, message, options = { qos: 1, retain: false }) {
    mqttClient.publish(topic, message, options, (err) => {
      if (err) {
        console.error(`Failed to publish message to topic ${topic}:`, err);
      } else {
        console.log(`Successfully published message to topic ${topic}: ${message}`);
      }
    });
  }
  
  module.exports = { subscribe, publish };
  