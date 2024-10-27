

function handleDoorAccess(mqttClient) {

    const topic = 'doorStatus';

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
          const doorMessage = JSON.parse(message.toString());
          console.log(doorMessage);
          const doorStatus = doorMessage.msg;
          console.log(doorStatus);

            if (doorStatus === 'opened') {
                ///Consult in DB acolyte isInsideTower status (exiting or entering?)
                ///socket to acolyte isInsideTower true/false to change screen
                ///Patch in DB isInsideTower to true/false
                //Publish topic action with message close door
                console.log('lets go');
            }

            if (doorStatus === 'closed') {
                //executeFunction of idCardHandler
                console.log('stop');
            }



        }
      });
    }

    module.exports = { handleDoorAccess };