const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// ----------- DEBUG LOGI (BARDZO WAŻNE) -----------
app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});

// ------------- CORS + JSON --------------
app.use(cors());
app.use(bodyParser.json());

// ------------- VAPID KEYS --------------
// UŻYWAMY TYCH SAMYCH CO NA FRONTENDZIE
const PUBLIC_VAPID =
  "Bp25KqE5Oj79kg2yiLvThWtrl6Ao4yHtN4UaFqljwYs-8OkKQ6xD-LZ2rNh7so1jDP85zvlFIzJp29uKOZMqUrg";

const PRIVATE_VAPID =
  "lNpUHMDfD7Cz7xTR8ioBoqvLGFn5NfRM3wqxy1tKCx4"; // <-- Twój prywatny klucz VAPID (z poprzednich danych)

webpush.setVapidDetails(
  "mailto:admin@example.com",
  PUBLIC_VAPID,
  PRIVATE_VAPID
);

// ----------- STORAGE --------------
let subscriptions = [];
let drugs = [];

// ------------- ENDPOINT: SUBSKRYPCJA -------------
app.post("/push/subscribe", (req, res) => {
  console.log(">>> SUBSKRYPCJA OTRZYMANA");
  console.log(req.body);
  subscriptions.push(req.body);
  res.sendStatus(201);
});

// ------------- ENDPOINT: LISTA LEKÓW -------------
app.post("/drugs/update", (req, res) => {
  console.log(">>> LISTA LEKÓW OTRZYMANA");
  console.log(req.body);
  drugs = req.body;
  res.sendStatus(200);
});

// ----------- WYSYŁANIE POWIADOMIEŃ --------------
setInterval(() => {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const current = `${hh}:${mm}`;

  drugs.forEach((drug) => {
    if (drug.time === current) {
      const payload = JSON.stringify({
        title: drug.name,
        body: `Godzina podania: ${drug.time}`,
      });

      subscriptions.forEach((sub) => {
        webpush.sendNotification(sub, payload).catch((err) => {
          console.error("PUSH ERROR:", err);
        });
      });
    }
  });
}, 60000);

app.listen(3000, () => console.log("Backend działa na porcie 3000"));