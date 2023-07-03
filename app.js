const express = require("express");
const Sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: Sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

//converting the snake_case to camelCase

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//Returns a list of all players in the team GET API1

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT * FROM cricket_team;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((each) => convertDbObjectToResponseObject(each))
  );
});

//Add a player in team POST API2

app.post("/players/", async (request, response) => {
  const cricketTeam = request.body;
  const { playerName, jerseyNumber, role } = cricketTeam;
  const addPlayerQuery = `INSERT INTO 
    cricket_team(
         player_name,
        jersey_number,
        role)
    VALUES 
    ('${playerName}',
    '${jerseyNumber}',
    '${role}')`;
  const dbResponse = await db.run(addPlayerQuery);
  const playerId = dbResponse.lastId;
  response.send("Player Added to Team");
});

//getting player details using id get API3

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayedDetails = `SELECT * FROM cricket_team WHERE player_id='${playerId}';`;
  const playerDetails = await db.get(getPlayedDetails);
  response.send(convertDbObjectToResponseObject(playerDetails));
});

//Updating a player details PUT API4

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const putQuery = `UPDATE cricket_team 
    SET 
     player_name = '${playerName}',
     jersey_number = '${jerseyNumber}',
     role = '${role}'
     WHERE player_id = '${playerId}';`;
  await db.run(putQuery);
  response.send("Player Details Updated");
});

//Delete a player details DELETE API 5

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `DELETE FROM cricket_team WHERE player_id = '${playerId}';`;
  await db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
