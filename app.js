const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const LOGIN = "83d8909a-b053-40bc-b4cd-4268e60b19b3";

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});

app.use(express.urlencoded({ extended: true }));

app.get("/login/", (_, res) => {
  res.send(LOGIN);
});

app.post("/insert/", async (req, res) => {
  let client;
  try {
    const { login, password, URL } = req.body;
    if (!login || !password || !URL) {
      return res.status(400).send("Missing fields");
    }

    client = new MongoClient(URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await client.connect();
    const dbName = URL.split("/").pop().split("?")[0];
    const db = client.db(dbName);
    const usersCollection = db.collection("users");

    await usersCollection.insertOne({
      login,
      password,
      createdAt: new Date(),
    });

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  } finally {
    if (client) await client.close();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
