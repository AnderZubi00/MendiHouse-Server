const { toggleIsInsideTowerByEmail } = require('../database/Player');

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
          const doorEmail = doorMessage.email;
          console.log(doorEmail); //this is sent when published action doorOpen + email

          //desde esp32 recibes message of opened door y para quien (asi evitamos que pase otro y le pasamos el email a BD para decir que eeee se abre solo para este email)

            if (doorStatus === 'opened') {
                ///Consult in DB acolyte isInsideTower status (exiting or entering?)
                //Patch to new value insInsideTower to opposite
                //Socket new value to acolyte to change screen
                toggleIsInsideTowerByEmail(doorEmail);
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