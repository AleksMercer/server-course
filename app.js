const express = require("express");
const axios = require("axios");
const pug = require("pug");

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});

const login = "83d8909a-b053-40bc-b4cd-4268e60b19b3";
app.get("/login/", (_, res) => {
  res.send(login);
});

app.get("/wordpress/wp-json/wp/v2/posts/1", (_, res) => {
  res.json({
    id: 1,
    slug: login,
    title: {
      rendered: login,
    },
    content: {
      rendered: "",
      protected: false,
    },
  });
});

app.use(express.json());

app.post("/render/", async (req, res) => {
  const { random2, random3 } = req.body;
  const { addr } = req.query;

  try {
    const templateResponse = await axios.get(addr);
    const pugTemplate = templateResponse.data;

    const compiled = pug.compile(pugTemplate);
    const html = compiled({ random2, random3 });

    res.set("Content-Type", "text/html");
    res.send(html);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing template");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
