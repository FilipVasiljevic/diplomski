var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var cors = require("cors");
const dbConfig = require("./db.config.js");
const bcrypt = require("bcrypt");
var mysql = require("mysql");
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
  cors()
);

var dbConn = mysql.createConnection({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
});

dbConn.connect();

//NAPRAVITI JEDAN DODATNI UVJET NA KOŠARICI. SAMO AKO JE IZNOS RAČUNA JEDNAK NULI. KADA SE RAČUN ZAVRŠAVA UBACUJE SE KORISNIK ID (PITA SE AKO SE KORISNIK ŽELI ULOGIRATI ILI REGISTRIRATI) I UKUPNA CIJENA. ++
//MYB NAPRAVITI DA BUDE CARRUSEL NA SVAKOM ITEMU --
//DODATI U KOŠARICI KADA SE PRITINE OBRIŠI PROIZVOD DA SE POJAVI JESTE LI SIGURNI ++
//NAPRAVITI U KOŠARICI PROMJENU KOLIČINE DO KRAJA ++

app.get("/users", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  dbConn.query("SELECT * FROM korisnici", function (error, results, fields) {
    if (error) throw error;
    const count = results.length;
    const responseData = { data: { userdata: { results } }, count: count };
    return response.send(responseData);
  });
});

app.get("/bills", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  dbConn.query(
    "SELECT * FROM racuni LEFT JOIN korisnici ON racuni.korisnikID = korisnici.korisnikID",
    function (error, results, fields) {
      if (error) throw error;
      const count = results.length;
      const responseData = { data: { userdata: { results }, count: count } };
      return response.send(responseData);
    }
  );
});

app.get("/billItems", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  dbConn.query(
    "SELECT * FROM stavkeracuna ",
    function (error, results, fields) {
      if (error) throw error;
      const count = results.length;
      const responseData = { data: { userdata: { results }, count: count } };
      return response.send(responseData);
    }
  );
});

app.get("/everything", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  dbConn.query("SELECT * FROM racuni", function (error, results, fields) {
    if (error) throw error;
    const count = results.length;
    dbConn.query("SELECT * FROM stavkeracuna ", (error, stavke) => {
      if (error) throw error;
      const countSt = stavke.length;
      const responseData = {
        data: {
          racuni: { results, count: count },
          stavke: { stavke, countSt: countSt },
        },
      };
      return response.send(responseData);
    });
  });
});

app.get("/checkAndUpdateItems/:id", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");

  const racunID = request.params.id;

  dbConn.query(
    "SELECT * FROM stavkeracuna WHERE racunID = ?",
    [racunID],
    function (error, results, fields) {
      if (error) throw error;

      const proizvodMap = new Map();

      // Group results by proizvodID
      for (const result of results) {
        if (proizvodMap.has(result.proizvodID)) {
          proizvodMap.get(result.proizvodID).push(result);
        } else {
          proizvodMap.set(result.proizvodID, [result]);
        }
      }

      // Check if any proizvodID has at least two results
      let hasDuplicates = false;
      let firstResult;
      let secondResult;
      for (const proizvodResults of proizvodMap.values()) {
        if (proizvodResults.length >= 2) {
          hasDuplicates = true;
          firstResult = proizvodResults[0];
          secondResult = proizvodResults[1];
          break;
        }
      }

      if (hasDuplicates) {
        const sumKolicina =
          firstResult.kolicinaProizvoda + secondResult.kolicinaProizvoda;
        const sumCijena =
          firstResult.ukupnaCijenaProizvoda +
          secondResult.ukupnaCijenaProizvoda;

        dbConn.query(
          "UPDATE stavkeracuna SET kolicinaProizvoda = ?, ukupnaCijenaProizvoda = ? WHERE stavkeID = ?",
          [sumKolicina, sumCijena, firstResult.stavkeID],
          function (updateError, updateResults, updateFields) {
            if (updateError) throw updateError;

            dbConn.query(
              "DELETE FROM stavkeracuna WHERE stavkeID = ?",
              [secondResult.stavkeID],
              function (deleteError, deleteResults, deleteFields) {
                if (deleteError) throw deleteError;

                return response.send(results);
              }
            );
          }
        );
      } else {
        return response.send(results);
      }
    }
  );
});

app.get("/billItems", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  dbConn.query(
    "SELECT * FROM stavkeracuna ",
    function (error, results, fields) {
      if (error) throw error;
      const count = results.length;
      const responseData = { data: { userdata: { results } }, count: count };
      return response.send(responseData);
    }
  );
});

app.get("/billAndBillItems1", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  dbConn.query(
    "SELECT * FROM racuni LEFT JOIN stavkeracuna ON racuni.racunID = stavkeracuna.racunID LEFT JOIN korisnici ON racuni.korisnikID = korisnici.korisnikID",
    function (error, results, fields) {
      if (error) throw error;
      const count = results.length;
      const responseData = [];
      results.forEach((result) => {
        const existingData = responseData.find(
          (data) => data.racunID === result.racunID
        );

        if (existingData) {
          existingData.stavkeRacuna.push({
            stavkeID: result.stavkeID,
            proizvodID: result.proizvodID,
            kolicinaProizvoda: result.kolicinaProizvoda,
            ukupnaCijenaProizvoda: result.ukupnaCijenaProizvoda,
          });
          existingData.countst = existingData.stavkeRacuna.length; // Add count property
        } else {
          responseData.push({
            racunID: result.racunID,
            korisnikID: result.korisnikID,
            datumRacuna: result.datumRacuna,
            iznosRacuna: result.iznosRacuna,
            imePrezime: result.imePrezime,
            korisnickiMail: result.korisnickiMail,
            korisnickaLozinka: result.korisnickaLozinka,
            adresa: result.adresa,
            grad: result.grad,
            postanskiBroj: result.postanskiBroj,
            stavkeRacuna: [
              {
                stavkeID: result.stavkeID,
                proizvodID: result.proizvodID,
                kolicinaProizvoda: result.kolicinaProizvoda,
                ukupnaCijenaProizvoda: result.ukupnaCijenaProizvoda,
              },
            ],
            countst: 1,
          });
        }
      });
      const endResponseData = {
        data: { userdata: { responseData }, count: count },
      };

      return response.send(endResponseData);
    }
  );
});

app.get("/billAndBillItems", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  dbConn.query(
    "SELECT * FROM racuni LEFT JOIN stavkeracuna ON racuni.racunID = stavkeracuna.racunID LEFT JOIN korisnici ON racuni.korisnikID = korisnici.korisnikID",
    function (error, results, fields) {
      if (error) throw error;
      const count = results.length;
      const responseData = { data: { userdata: { results }, count: count } };
      return response.send(responseData);
    }
  );
});

app.get("/items", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  dbConn.query(
    "SELECT proizvodi.proizvodID, proizvodi.nazivProizvoda, proizvodi.cijenaProizvoda, proizvodi.opisProizvoda, MIN(slikeproizvoda.slika) AS slika FROM proizvodi LEFT JOIN slikeproizvoda ON proizvodi.proizvodID = slikeproizvoda.proizvodID GROUP BY proizvodi.proizvodID, proizvodi.nazivProizvoda;",
    function (error, results, fields) {
      if (error) throw error;
      return response.send({
        error: false,
        data: results,
        message: "Proizvodi",
      });
    }
  );
});

// app.get("/itemss", function (request, response) {
//   response.set("Access-Control-Allow-Origin", "*");
//   dbConn.query("SELECT * FROM proizvodi", function (error, results, fields) {
//     if (error) throw error;
//     return response.send({
//       error: false,
//       data: results,
//       message: "Proizvodi",
//     });
//   });
// });

app.get("/shoppingItems", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  dbConn.query(
    "SELECT stavkeracuna.stavkeID, stavkeracuna.racunID, stavkeracuna.proizvodID, stavkeracuna.kolicinaProizvoda, stavkeracuna.ukupnaCijenaProizvoda, proizvodi.nazivProizvoda AS nazivProizvoda, proizvodi.cijenaProizvoda AS pojedinacnaCijena, slikeproizvoda.slika AS slika FROM stavkeracuna LEFT JOIN proizvodi ON stavkeracuna.proizvodID = proizvodi.proizvodID LEFT JOIN (SELECT proizvodID, slika FROM slikeproizvoda GROUP BY proizvodID LIMIT 1) slikeproizvoda ON proizvodi.proizvodID = slikeproizvoda.proizvodID LEFT JOIN racuni ON stavkeracuna.racunID = racuni.racunID WHERE stavkeracuna.racunID = (SELECT MAX(racunID) FROM racuni WHERE racuni.iznosRacuna = 0) AND racuni.korisnikID IS NULL",
    function (error, results, fields) {
      if (error) throw error;
      return response.send({
        error: false,
        data: results,
        message: "Stavke racuna",
      });
    }
  );
});

app.get("/userBills/:id", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  const userID = request.params.id;
  dbConn.query(
    "SELECT * FROM racuni WHERE korisnikID = ? AND iznosRacuna = 0",
    [userID],
    function (error, results, fields) {
      if (error) throw error;
      const count = results.length;
      return response.send({
        error: false,
        data: results,
        count: count,
      });
    }
  );
});

app.get("/checkItem", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  const racunID = request.query.racunID;
  const proizvodID = request.query.proizvodID;
  const query =
    "SELECT * FROM stavkeracuna LEFT JOIN proizvodi on stavkeracuna.proizvodID = proizvodi.proizvodID WHERE stavkeracuna.racunID = ? AND stavkeracuna.proizvodID = ?";
  //console.log(racunID, proizvodID);
  dbConn.query(query, [racunID, proizvodID], (error, results) => {
    if (error) throw error;
    return response.send({ data: results });
  });
});

app.put("/updateItem", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  const { kolicinaProizvoda, ukupnaCijenaProizvoda, stavkeID } = request.body;
  const query =
    "UPDATE stavkeracuna SET kolicinaProizvoda = ?, ukupnaCijenaProizvoda = ? WHERE stavkeID = ?";
  dbConn.query(
    query,
    [kolicinaProizvoda, ukupnaCijenaProizvoda, stavkeID],
    (error, results) => {
      if (error) {
        console.error("Error executing update query:", error);
        response.status(500).send("Error executing update query");
      } else {
        return response.send({ message: "Update successful" });
      }
    }
  );
});

app.put("/updateBillItems", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  const { racunIDnew, racunIDold } = request.body;
  const query = "UPDATE stavkeracuna SET racunID = ? WHERE racunID = ?";
  const queryRacun = "DELETE FROM racuni WHERE racunID = ?";
  dbConn.query(query, [racunIDnew, racunIDold], (error, results) => {
    if (error) {
      console.error("Error executing update query:", error);
      response.status(500).send("Error executing update query");
    } else {
      dbConn.query(queryRacun, [racunIDold], (error, results) => {
        if (error) throw error;
        return response.send({ message: "Update successful" });
      });
    }
  });
});

app.put("/updateBillItemss", async (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  const { racunIDnew, racunIDold } = request.body;
  const getExistingItemsQuery = "SELECT * FROM stavkeracuna WHERE racunID = ?";
  const deleteExistingItemsQuery = "DELETE FROM stavkeracuna WHERE racunID = ?";
  const insertItemStmt =
    "INSERT INTO stavkeracuna (racunID, proizvodID, kolicinaProizvoda, ukupnaCijenaProizvoda) VALUES (?, ?, ?, ?)";
  const newItems = request.body.stavkeRacuna;

  try {
    const [existingItems] = await dbConn.query(getExistingItemsQuery, [
      racunIDold,
    ]);

    await dbConn.query(deleteExistingItemsQuery, [racunIDold]);

    const itemsMap = new Map(); // To store unique items by proizvodID

    existingItems.forEach((item) => {
      if (itemsMap.has(item.proizvodID)) {
        // Item already exists, sum the quantities and prices
        const existingItem = itemsMap.get(item.proizvodID);
        existingItem.kolicinaProizvoda += item.kolicinaProizvoda;
        existingItem.ukupnaCijenaProizvoda += item.ukupnaCijenaProizvoda;
      } else {
        // Item is unique, add it to the map
        itemsMap.set(item.proizvodID, item);
      }
    });

    newItems.forEach((newItem) => {
      if (itemsMap.has(newItem.proizvodID)) {
        // Item already exists, sum the quantities and prices
        const existingItem = itemsMap.get(newItem.proizvodID);
        existingItem.kolicinaProizvoda += newItem.kolicinaProizvoda;
        existingItem.ukupnaCijenaProizvoda += newItem.ukupnaCijenaProizvoda;
      } else {
        // Item is unique, add it to the map
        itemsMap.set(newItem.proizvodID, newItem);
      }
    });

    const processedItems = Array.from(itemsMap.values());

    for (let i = 0; i < processedItems.length; i++) {
      const item = processedItems[i];

      await dbConn.query(insertItemStmt, [
        racunIDnew,
        item.proizvodID,
        item.kolicinaProizvoda,
        item.ukupnaCijenaProizvoda,
      ]);
    }

    response.send({
      processedItems,
      message: "Update successful",
    });
  } catch (error) {
    console.error("Error updating bill items:", error);
    response.status(500).send("Error updating bill items");
  }
});

app.get("/shoppingItems/:id", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  const userID = request.params.id;
  dbConn.query(
    "SELECT stavkeracuna.stavkeID, stavkeracuna.racunID, stavkeracuna.proizvodID, stavkeracuna.kolicinaProizvoda, stavkeracuna.ukupnaCijenaProizvoda, proizvodi.nazivProizvoda AS nazivProizvoda, proizvodi.cijenaProizvoda AS pojedinacnaCijena, slikeproizvoda.slika AS slika FROM stavkeracuna LEFT JOIN proizvodi ON stavkeracuna.proizvodID = proizvodi.proizvodID LEFT JOIN (SELECT proizvodID, slika FROM slikeProizvoda GROUP BY proizvodID LIMIT 1) slikeproizvoda ON proizvodi.proizvodID = slikeproizvoda.proizvodID LEFT JOIN racuni ON stavkeracuna.racunID = racuni.racunID WHERE stavkeracuna.racunID = ( SELECT MAX(racunID) FROM racuni WHERE racuni.iznosRacuna = 0 AND racuni.korisnikID = ?)",
    [userID],
    function (error, results, fields) {
      if (error) throw error;
      return response.send({
        error: false,
        data: results,
        message: "Stavke racuna",
      });
    }
  );
});

app.put("/closeBill/:id", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  const racunID = request.params.id;
  //console.log(racunID);
  const query =
    "SELECT SUM(ukupnaCijenaProizvoda) AS totalSum FROM stavkeracuna WHERE racunID = ?";
  dbConn.query(query, [racunID], (error, results) => {
    if (error) {
      response
        .status(500)
        .json({ message: "Error retrieving sum of total cost" });
    } else {
      const totalSum = results[0].totalSum;
      const updateQuery = "UPDATE racuni SET iznosRacuna = ? WHERE racunID = ?";
      dbConn.query(updateQuery, [totalSum, racunID], (error, results) => {
        if (error) throw error;
        return response.send({
          data: totalSum,
        });
      });
    }
  });
});

// app.get("/shoppedItems", function (request, response) {
//   response.set("Access-Control-Allow-Origin", "*");
//   const query = "SELECT * FROM stavkeracuna";
//   dbConn.query(query, function (error, shoppedItems) {
//     if (error) throw error;
//     return;
//   });
//   shoppedItems.forEach((shoppedItem) => {
//     const queryItems = "SELECT * FROM proizvodi WHERE proizvodID = ?";
//     dbConn.query(queryItems, [shoppedItem.proizvodID], (error, items) => {
//       if (error) throw error;
//       shoppedItem.nazivProizvoda = item.nazivProizvoda;
//       shoppedItem.cijenaProizvoda = item.cijenaProizvoda;
//       shoppedItem.opisProizvoda = item.opisProizvoda;
//     });
//   });
// });

app.get("/item/:id", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  const lineId = request.params.id;
  const query =
    "SELECT * FROM proizvodi LEFT JOIN slikeproizvoda ON proizvodi.proizvodID = slikeproizvoda.proizvodID WHERE proizvodi.proizvodID = ?";

  // Retrieve the line from the database
  dbConn.query(query, [lineId], (error, results) => {
    if (error) {
      console.error(error);
    } else {
      return response.send({ data: results });
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

app.put("/update", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  const { stavkeID, kolicinaProizvoda, ukupnaCijenaProizvoda } = request.body;
  const query =
    "UPDATE stavkeracuna SET kolicinaProizvoda = ?, ukupnaCijenaProizvoda = ? WHERE stavkeID = ?";
  dbConn.query(
    query,
    [kolicinaProizvoda, ukupnaCijenaProizvoda, stavkeID],
    (error, results) => {
      if (error) {
        console.error("Error executing update query:", error);
        response.status(500).send("Error executing update query");
      } else {
        return response.send({ message: "Update successful" });
      }
    }
  );
});

app.get("/user/:email", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  const korisnickiMail = request.params.email;
  //console.log(korisnickiMail);
  const query = "SELECT * FROM korisnici WHERE korisnickiMail = ?";
  dbConn.query(query, [korisnickiMail], (error, results) => {
    if (error) {
      console.error(error);
    } else {
      //console.log(results);
      return response.send({ data: results });
    }
  });
});

// app.post("/loginN", (request, response) => {
//   const { korisnickiMail, korisnickaLozinka } = request.body;
//   const query =
//     "SELECT korisnickaLozinka FROM korisnici WHERE korisnickiMail = ?";

//   dbConn.query(query, [korisnickiMail], (error, results) => {
//     if (error) {
//       console.error("Error executing login query:", error);
//       response.status(500).send("Error executing login query");
//     } else {
//       if (results.length === 1) {
//         console.log(results.RowDataPacket, korisnickaLozinka);
//         bcrypt.compare(korisnickaLozinka, results, (error, results) => {
//           if (error) {
//             response.status(401).json({ message: "Invalid username" });
//           }
//           if (results === true) {
//             return response.send({ message: "Login successful" });
//           } else {
//             response.status(401).json({ message: "Invalid password" });
//           }
//         });
//       } else {
//         response.status(401).json({ message: "Invalid username or password" });
//       }
//     }
//   });
// });

app.post("/newUser", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  const {
    imePrezime,
    korisnickiMail,
    korisnickaLozinka,
    adresa,
    grad,
    postanskiBroj,
  } = request.body;
  const query =
    "INSERT INTO korisnici (imePrezime, korisnickiMail, korisnickaLozinka, adresa, grad, postanskiBroj) VALUES (?, ?, ?, ?, ?, ?)";
  dbConn.query(
    query,
    [
      imePrezime,
      korisnickiMail,
      korisnickaLozinka,
      adresa,
      grad,
      postanskiBroj,
    ],
    (error, results) => {
      if (error) {
        console.error("Error executing signup query:", error.sqlMessage);
        response.status(500).send("Error executing signup query");
      } else {
        if (results.length === 1) {
          return response.send({ message: "Signup successful" });
        } else {
          return response.send({
            message: "Korisnički račun s tim mailom več postoji",
          });
        }
      }
    }
  );
});

// app.post("/newUserr", function (request, response) {
//   response.set("Access-Control-Allow-Origin", "*");
//   const {
//     imePrezime,
//     korisnickiMail,
//     korisnickaLozinka,
//     adresa,
//     grad,
//     postanskiBroj,
//   } = request.body;
//   const query =
//     "INSERT INTO korisnici (imePrezime, korisnickiMail, korisnickaLozinka, adresa, grad, postanskiBroj) VALUES (?, ?, PASSWORD(?), ?, ?, ?)";
//   dbConn.query(
//     query,
//     [
//       imePrezime,
//       korisnickiMail,
//       korisnickaLozinka,
//       adresa,
//       grad,
//       postanskiBroj,
//     ],
//     (error, results) => {
//       if (error) {
//         console.error("Error executing signup query:", error.sqlMessage);
//         response.status(500).send("Error executing signup query");
//       } else {
//         if (results.length === 1) {
//           return response.send({ message: "Signup successful" });
//         } else {
//           return response.send({
//             message: "Korisnički račun s tim mailom več postoji",
//           });
//         }
//       }
//     }
//   );
// });

app.post("/newBillnoUser", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  const datum = new Date();
  const query = "INSERT INTO racuni (datumRacuna) VALUES (?)";
  dbConn.query(query, datum, (error, results) => {
    if (error) {
      console.error("Error inserting new bill:", error);
    } else {
      return response.send({
        message: "New bill opened successfully",
        data: results,
      });
    }
  });
});

app.post("/newBill", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  const datum = new Date();
  const { korisnikID } = request.body;
  const query =
    "INSERT INTO racuni (korisnikID, datumRacuna, iznosRacuna) VALUES (?, ?, '0.0')";
  dbConn.query(query, [korisnikID, datum], (error, results) => {
    if (error) {
      console.error("Error inserting new bill:", error);
    } else {
      return response.send({ message: "New bill opened successfully" });
    }
  });
});

app.get("/maxBills", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  dbConn.query(
    "SELECT * FROM racuni WHERE racunID = (SELECT MAX(racunID) FROM racuni WHERE iznosRacuna = 0)",
    function (error, results, fields) {
      if (error) throw error;
      return response.send({ data: results });
    }
  );
});

app.post("/newBillItem", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  const { racunID, proizvodID, kolicinaProizvoda, ukupnaCijenaProizvoda } =
    request.body;
  const query =
    "INSERT INTO stavkeracuna (racunID, proizvodID, kolicinaProizvoda, ukupnaCijenaProizvoda) VALUES (?, ?, ?, ?)";
  dbConn.query(
    query,
    [racunID, proizvodID, kolicinaProizvoda, ukupnaCijenaProizvoda],
    (error, results) => {
      if (error) {
        console.error(error);
      } else {
        return response.send({ message: "New bill item added" });
      }
    }
  );
});

app.put("/newBillOwner", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  const { korisnikID, racunID } = request.body;
  //console.log(korisnikID, racunID);
  const query = "UPDATE racuni SET korisnikID = ? WHERE racunID = ?";
  dbConn.query(query, [korisnikID, racunID], (error, results) => {
    if (error) throw error;
    else {
      return response.send({ message: "Update successful" });
    }
  });
});

app.delete("/deleteCartItem/:id", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  const idStavke = request.params.id;
  const query = "DELETE FROM stavkeracuna WHERE stavkeID = ?";

  dbConn.query(query, [idStavke], (error, results) => {
    if (error) {
      console.error(error);
      response.status(500).json({ error: "Internal server error" });
    } else {
      if (results.affectedRows > 0) {
        response.json({ message: "Cart item deleted successfully" });
      } else {
        response.status(404).json({ error: "Cart item not found" });
      }
    }
  });
});

app.delete("/deleteBill/:id", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  const idRacuna = request.params.id;
  const query = "DELETE FROM racuni WHERE racunID = ?";

  dbConn.query(query, [idRacuna], (error, results) => {
    if (error) throw error;
    if (results.affectedRows > 0) {
      response.json({ message: "Bill deleted successfully" });
    } else {
      response.status(404).json({ error: "Bill not found" });
    }
  });
});

app.listen(3000, function () {
  console.log("Node app is running on port 3000");
});
module.exports = app;
