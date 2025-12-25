import express from "express";
import puppeteer from "puppeteer";

const app = express();
const LOGIN = " 83d8909a-b053-40bc-b4cd-4268e60b19b3";

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});

app.get("/login/", (_, res) => {
  res.set("Content-Type", "text/plain").send(LOGIN);
});

app.get("/test/", async (req, res) => {
  const targetURL = req.query.URL;

  if (!targetURL) {
    return res.status(400).send("Missing URL parameter");
  }

  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--single-process",
      ],
      executablePath: process.env.CHROMIUM_PATH || puppeteer.executablePath(),
    });

    const page = await browser.newPage();

    await page.goto(targetURL, {
      waitUntil: "networkidle2",
      timeout: 15000,
    });

    await page.click("#bt");

    await page.waitForFunction(
      () => {
        const input = document.querySelector("#inp");
        return input && input.value !== "";
      },
      { timeout: 5000 }
    );

    const result = await page.evaluate(() => {
      return document.querySelector("#inp").value;
    });

    res.set("Content-Type", "text/plain").send(result);
  } catch (error) {
    console.error("Puppeteer error:", error);
    res.status(500).send(`Error: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
