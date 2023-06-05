const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3002, () => {
      console.log("Server Running at http://localhost:3002/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

// Get Players API
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
      cricket_team;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) => convertObjectToResponseObject(eachPlayer))
  );
});

//POST A NEW PLAYER

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const postPlayerQuery = `
    INSERT INTO cricket_team (player_name,jersey_number,role)
    VALUES ('${playerName}','${jerseyNumber}','${role}');`;
  response.send("Player Added to Team");
});

//GET A PLAYER PROFILE

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerProfile = `
    SELECT * FROM cricket_team
    WHERE player_id = ${playerId};`;
  const player = await db.get(getPlayerProfile);
  response.send(convertObjectToResponseObject(player));
});

//PUT A PLAYER PROFILE

app.put("/players/:playerId", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const { playerId } = request.params;
  const updatePlayerQuery = `
    UPDATE cricket_team
    SET player_name = '${playerName}',
    jersey_number = '${jerseyNumber}',
    role = '${role}'
    WHERE player_id = '${playerId}';`;

  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//DELETE A PLAYER PROFILE

app.delete("/player/:playerId", async (request, response) => {
  const playerId = request.params;
  const deletePlayerQuery = `
    DELETE FROM cricket_team
    WHERE player_id = '${playerId}';`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
