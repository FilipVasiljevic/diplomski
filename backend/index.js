var express = require("express");
var app = express();
var bodyParser = require("body-parser");
const dbConfig = require("./db.config.js");
var mysql = require("mysql");
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

var dbConn = mysql.createConnection({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
});

dbConn.connect();

app.get("/users", function (request, response) {
  dbConn.query("SELECT * FROM korisnici", function (error, results, fields) {
    if (error) throw error;
    return response.send({ error: false, data: results, message: "Korisnici" });
  });
});

app.get("/items", function (request, response) {
  dbConn.query("SELECT * FROM proizvodi", function (error, results, fields) {
    if (error) throw error;
    return response.send({ error: false, data: results, message: "Proizvodi" });
  });
});

app.listen(3000, function () {
  console.log("Node app is running on port 3000");
});
module.exports = app;
