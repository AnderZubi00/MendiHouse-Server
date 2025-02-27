  const admin = require('firebase-admin')
  // Import function to create the message object for the push notifications
  const { createMessageForPushNotification } = require('../messages/messagePushNotifications');
  const { findPlayersByRole, toggleIsInsideTowerByEmail, findPlayerByEmail, getAllAcolytes } = require('../database/Player');

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

      let bodyText = '';
      let titleText = '';
      let messageTopic = '';

      // Obtain the Mortimers data
      const mortimers = await findPlayersByRole("MORTIMER");
      console.log("Data from players with role MORTIMER: ");
      // console.log(mortimers);

      // Obtain the fcm_token from the Mortimer players array to send the push notification
      const fcm_tokens = mortimers.map(mortimer => mortimer.fcm_token);

      let isPlayerInsideTowerScreensBool = await isPlayerInsideTowerScreens(email, mqttClient, io);
      if (!isPlayerInsideTowerScreensBool) return;

      // Await the asynchronous operation to ensure it completes
      const newPlayerData = await toggleIsInsideTowerByEmail(email);

      console.log("SocketId: ", newPlayerData.socketId);

      // Send confirmation message to the client who scanned the acolyte
      io.to(newPlayerData.socketId).emit("toggleInsideTower", { success: true, playerData: newPlayerData });

      console.log('Acolyte has entered or exited the tower successfully');

      // Add the text to the message body and title, for the message we want to send on the push notification
      bodyText = 'An acolyte tried to open the door fo The Tower and success.';
      titleText = 'The tower door has been opened!!!';
      messageTopic = 'SuccessOpeningDoor';

      // Create the message object to modify to send it, with fcm_token to send the message to the correct device/user
      const messageWarningSomeoneSuccessOpeningTheTowerDoor = createMessageForPushNotification(bodyText, titleText, fcm_tokens, messageTopic);

      console.log(messageWarningSomeoneSuccessOpeningTheTowerDoor);

      // Send message to mortimer that an acolyte failed to open the door
      sendPushNotification(messageWarningSomeoneSuccessOpeningTheTowerDoor);

    } catch (error) {
      console.log('Error entering the acolyte to tower. Error: ', error);
    }
  }

  async function isPlayerInsideTowerScreens(email, mqttClient, io) {

    console.log(" === Entered method isPlayerInsideTowerScreens ===");

    const playerCurrentScreen = await getPlayerScreen(email, io);
    console.log("playerCurrentScreen");
    console.log(playerCurrentScreen);

    if (playerCurrentScreen !== "TowerDoorScreen" && playerCurrentScreen !== "Tower Screen") {
      console.log("The player is not in the screen 'TowerDoorScreen' or inside the Tower, so he can not enter or exit the tower.");

      // Notify ESP32 that player can not enter the tower.
      mqttClient.publish('MendiHouse/doorAction', JSON.stringify({ action: 'notInScreen' }), (err) => {
        if (err) {
          console.error("Failed to publish 'doorAction' topic:", err);
        } else {
          console.log("Published. TOPIC: ['doorAction'] PAYLOAD: { action: 'notInScreen' }");
        }
      });

      return false;
    }

    console.log('The player is inside "TowerDoorScreen" or "Tower Screen"');
    return true;
  }


  function sendPushNotification(message) {

    admin
      .messaging()
      .sendEachForMulticast(message)
      .then(response => {
        console.log('Successfully sent message:');
        console.log('Success count:', response.successCount);
        console.log('Failure count:', response.failureCount);
      })
      .catch(error => {
        console.log('Error sending message:', error);
      });
  }


  async function getPlayersInsideHall() {

    // Get the Acolyte List
    let acolytesList = await getAllAcolytes();

    // Get the Mortimer List
    let mortimersList = await findPlayersByRole('MORTIMER');

    // Get the Villain List
    let villainsList = await findPlayersByRole('VILLAIN');

    // Return only the players inside the hall
    acolytesList = acolytesList.filter(acolyte => acolyte?.isInsideHall);
    const mortimer = mortimersList.filter(mortimer => mortimer?.isInsideHall)[0];
    const villain = villainsList.filter(villain => villain?.isInsideHall)[0]; 

    let playersObject = {
      acolytesList: acolytesList, 
      mortimer: mortimer,
      villain: villain,
    };

    return playersObject;
  }
  
  const updateClientPlayerData = async (email, io) => {

    try {
 
      console.log("==== EXECUTING 'updateClientPlayerData()' ====");
  
      if (!email) { throw new Error("Email not provided.") }
      if (!io) { throw new Error("io object not provided.") }

      const playerData = await findPlayerByEmail(email);
      if (!playerData) { throw new Error(`Player with email '${email}' not found`) }
  
      const playerSocketId = playerData.socketId;
      if (!playerSocketId) { throw new Error(`Player does not have a SocketID value in the database`) }
        
      io.to(playerSocketId).emit('updatePlayerData', { playerData: playerData });
      console.log("Update socket sent to client");

    } catch (error) {
      console.log("Error in function 'updateClientPlayerData()': ", error)
      throw error;
    }

  }

  const refreshAcolytesList = async (io, role) => {

    // Send socket to a certain role to send a socket 'refreshAcolytesList'.
    try {

      console.log("==== EXECUTING 'refreshCureRoomAcoltyes()' ====");
      
      if (!io) { throw new Error("io object not provided.") }
      if (!role) { throw new Error("role not provided.") }

      const notifiedPlayers = await findPlayersByRole(role);
      if (!notifiedPlayers) {console.log(`No player with role ${role} found in database.`); return}

      notifiedPlayers.forEach(notifiedPlayer => {
        if (!notifiedPlayer?.socketId) {console.log(`${notifiedPlayer.nickname} does not have a socketId in database`)}
        io.to(notifiedPlayer?.socketId).emit("refreshAcolytesList", {});
        console.log(`Update socket sent to ${notifiedPlayer.nickname} successfully.`)
      });

    } catch (error) {
      console.log("Error in function 'refreshCureRoomAcoltyes()': ", error)
      throw error;
    }

  }

  module.exports = {
    toggleAcolyteInsideTower,
    sendPushNotification,
    getPlayerScreen,
    isPlayerInsideTowerScreens,
    getPlayersInsideHall,
    updateClientPlayerData,
    refreshAcolytesList
  }