const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PUBLIC_VAPID = "KezGVTYNjwE7pPBtRe-Vyc1aQJtmqPjTdYhea55BJ_pnjrlibD3zqKHxJiv4pRvm2m11xWMm1DVku6H6SSlLqHI";
const PRIVATE_VAPID = "l1dEZaXBL4_rX_X59Ki0cLxnBCq5_bXLBtcbn1uY3-o";

webpush.setVapidDetails(
  "mailto:admin@example.com",
  PUBLIC_VAPID,
  PRIVATE_VAPID
);

let subscriptions = [];
let drugs = [];

app.post("/push/subscribe", (req, res) => {
  subscriptions.push(req.body);
  res.sendStatus(201);
});

app.post("/drugs/update", (req, res) => {
  drugs = req.body;
  res.sendStatus(200);
});

setInterval(() => {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const current = `${hh}:${mm}`;

  drugs.forEach(drug => {
    if (drug.time === current) {
      const payload = JSON.stringify({
        title: drug.name,
        body: `Godzina podania: ${drug.time}`
      });

      subscriptions.forEach(sub => {
        webpush.sendNotification(sub, payload).catch(() => {});
      });
    }
  });
}, 60000);

app.listen(3000, () => console.log("Backend działa na porcie 3000"));
