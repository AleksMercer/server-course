export default (express, bodyParser, createReadStream, crypto, http) => {
  const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,OPTIONS,DELETE",
    "Access-Control-Allow-Headers": "*",
  };

  const TEXT_PLAIN_HEADER = { "Content-Type": "text/plain; charset=utf-8" };
  const SYSTEM_LOGIN = "83d8909a-b053-40bc-b4cd-4268e60b19b3";

  const corsMiddleware = (req, res, next) => {
    for (const [header, value] of Object.entries(CORS_HEADERS)) {
      res.setHeader(header, value);
    }
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  };

  const ensureTrailingSlash = (req, res, next) => {
    if (!req.path.endsWith("/") && req.path.length > 1) {
      const query = req.url.slice(req.path.length);
      return res.redirect(301, `${req.path}/${query}`);
    }
    next();
  };

  const app = express();
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(corsMiddleware);
  app.use(ensureTrailingSlash);

  app.get("/login/", (_, res) => {
    res.set(TEXT_PLAIN_HEADER).send(SYSTEM_LOGIN);
  });

  app.get("/code/", async (_, res) => {
    try {
      const filePath = new URL(import.meta.url).pathname;
      const normalizedPath =
        process.platform === "win32" ? filePath.substring(1) : filePath;

      const readStream = createReadStream(normalizedPath);
      let data = "";
      for await (const chunk of readStream) data += chunk;

      res.set(TEXT_PLAIN_HEADER).send(data);
    } catch (error) {
      res.status(500).send("Error reading file");
    }
  });

  app.get("/sha1/:input/", (req, res) => {
    const hash = crypto
      .createHash("sha1")
      .update(req.params.input)
      .digest("hex");
    res.set(TEXT_PLAIN_HEADER).send(hash);
  });

  const handleReq = async (addr, res) => {
    try {
      return new Promise((resolve, reject) => {
        http
          .get(addr, (response) => {
            let data = "";
            response.on("data", (chunk) => (data += chunk));
            response.on("end", () =>
              resolve(res.set(TEXT_PLAIN_HEADER).send(data))
            );
          })
          .on("error", reject);
      });
    } catch (error) {
      res.status(500).send(error.toString());
    }
  };

  app.get("/req/", (req, res) => handleReq(req.query.addr, res));
  app.post("/req/", (req, res) => handleReq(req.body.addr, res));

  app.all("*", (_, res) => {
    res.set(TEXT_PLAIN_HEADER).send(SYSTEM_LOGIN);
  });

  return app;
};
