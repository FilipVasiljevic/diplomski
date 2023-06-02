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
  response.set("Access-Control-Allow-Origin", "*");
  dbConn.query("SELECT * FROM korisnici", function (error, results, fields) {
    if (error) throw error;
    return response.send({ data: results });
  });
});

app.get("/items", function (request, response) {
  response.set("Access-Control-Allow-Origin", "*");
  dbConn.query("SELECT * FROM proizvodi", function (error, results, fields) {
    if (error) throw error;
    return response.send({ error: false, data: results, message: "Proizvodi" });
  });
});

app.get("/item/:id", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  const lineId = request.params.id;
  const query = "SELECT * FROM proizvodi WHERE proizvodID = ?";

  // Retrieve the line from the database
  dbConn.query(query, [lineId], (error, results) => {
    if (error) {
      console.error(error);
    } else {
      return response.send({ results });
    }
  });
});

app.post("/login", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  //request.set("Access-Control-Allow-Origin", "*");
  const { korisnickiMail, korisnickaLozinka } = request.body;
  const query =
    "SELECT * FROM korisnici WHERE korisnickiMail = ? AND korisnickaLozinka = ?";

  // Check if the username and password match in the database
  dbConn.query(query, [korisnickiMail, korisnickaLozinka], (error, results) => {
    if (error) {
      console.error("Error executing login query:", error);
      response.status(500).send("Error executing login query");
    } else {
      if (results.length === 1) {
        return response.send({ message: "Login successful" });
      } else {
        response.status(401).json({ message: "Invalid username or password" });
      }
    }
  });
});

app.post("/newUser", function (request, response) {
  response.set("Access-Control-Allow-Origin", "*");
  let signup = {};
  // const bb = busboy({ headers: req.headers });
  // bb.on("field", (name, val, info) => {
  //   // console.log(`Field [${name}]: value: %j`, val);
  //   signup[name] = val;
  // });
  dbConn.query(
    "INSERT INTO korisnici (imePrezime, korisnickiMail, korisnickaLozinka, adresa, grad, postanskiBroj) VALUES (",
    signup.imePrezime,
    signup.email,
    PASSWORD(signup.password),
    signup.adress,
    signup.city,
    signup.zipCode,
    ")",
    function (error, results, fields) {
      if (error) throw error;
      return response.send({
        error: false,
        data: results,
        message: "Uspjesno dodano",
      });
    }
  );

  // const signup = request.body;
  // console.log(signup.imePrezime);
  // return response.send(
  //   "POST metoda -> Create korisnici: imePrezime=" +
  //     signup.imePrezime +
  //     "; korisnickiMail=" +
  //     signup.email +
  //     "; korisnickaLozinka=" +
  //     PASSWORD(signup.password) +
  //     "; adresa=" +
  //     signup.adress +
  //     "; grad=" +
  //     signup.city +
  //     "; postanskiBroj=" +
  //     signup.zipCode +
  //     " ."
  // );
});

app.listen(3000, function () {
  console.log("Node app is running on port 3000");
});
module.exports = app;
