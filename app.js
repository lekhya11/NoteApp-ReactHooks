const express = require("express");

const path = require("path");

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,

      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`dB error:${e.message}`);

    process.exit(1);
  }
};

initializeDbAndServer();

// GET PLAYERS:

app.get("/players/", async (request, response) => {
  const getPlayers = `

    SELECT * 

    FROM cricket_team

    ORDER BY player_id;

  `;

  const playersArray = await db.all(getPlayers);

  response.send(playersArray);
});

// CREATE PLAYER:
app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;

  const addBookQuery = `

    INSERT INTO cricket_team (player_name,jersey_number,role)

    VALUES

      ('${playerName}', ${jerseyNumber}, '${role}');

  `;

  const dbResponse = await db.run(addBookQuery);

  const playerId = dbResponse.lastId;

  response.send(playerId);
});

module.exports = app;
