const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json()); //middleware to acess request body

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//API1 List of All Players in the Team
app.get("/players/", async (request, response) => {
  const getQuery = `SELECT * FROM cricket_team`;
  const TeamPlayers = await db.all(getQuery);
  //console.log(
  //TeamPlayers.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  //);
  response.send(
    TeamPlayers.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//API 2 Creates a new player in the team (database).

app.post("/players/", async (request, response) => {
  const teamDetails = request.body;
  const { playerName, jerseyNumber, role } = teamDetails;

  const addPlayerQuery = `INSERT INTO cricket_team(player_name,jersey_number,role)
        VALUES('${playerName}',${jerseyNumber},'${role}');`;

  const DBResponse = await db.run(addPlayerQuery);
  const playerId = DBResponse.lastID;
  //response.send({ playerId: playerId });
  response.send("Player Added to Team");
});

//API3 Returns a player based on a player ID

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `SELECT player_id AS playerId,
  player_name AS playerName,
  jersey_number AS jerseyNumber,
  role AS role
  FROM cricket_team WHERE player_id = ${playerId};`;
  const player = await db.get(getPlayer);
  //console.log(player);
  response.send(player);
});

//API4 Updates the details of a player in the team (database) based on the player ID

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const teamDetails = request.body;

  const { playerName, jerseyNumber, role } = teamDetails;
  const playerUpdateQuery = `UPDATE cricket_team SET
        player_name = '${playerName}',
        jersey_number = ${jerseyNumber},
        role = '${role}'
        WHERE player_id = ${playerId};`;
  await db.run(playerUpdateQuery);
  response.send("Player Details Updated");
});

//API Deletes a player from the team
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const DeletePlayer = `DELETE FROM cricket_team WHERE player_id = ${playerId};`;
  await db.run(DeletePlayer);
  response.send("Player Removed");
});

module.exports = app;
