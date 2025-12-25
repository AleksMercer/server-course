import express from "express";
import puppeteer from "puppeteer-core";

const app = express();
const LOGIN = "83d8909a-b053-40bc-b4cd-4268e60b19b3";

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});

app.get("/login/", (_, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.send(LOGIN);
});

app.get("/test/", async (req, res) => {
  const targetURL = req.query.URL;
  if (!targetURL) return res.status(400).send("Missing URL parameter");

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: "/usr/bin/chromium-browser",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-gpu",
      ],
      headless: "new",
    });

    const page = await browser.newPage();
    await page.goto(targetURL, { waitUntil: "networkidle2", timeout: 30000 });

    await page.click("#bt");

    await page.waitForFunction(
      () => {
        const input = document.querySelector("#inp");
        return input && input.value !== "";
      },
      { timeout: 10000 }
    );

    const result = await page.evaluate(() => {
      return document.querySelector("#inp").value;
    });

    res.setHeader("Content-Type", "text/plain");
    res.send(result);
  } catch (error) {
    console.error("Error in /test/ route:", error);
    res.status(500).send("Internal Server Error");
  } finally {
    if (browser) await browser.close();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
