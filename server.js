const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PUBLIC_VAPID = "BET0-VZnzqKEkjWK5rLssR90w-_uKCXKlqtLSbdkRxfO4KbWcYorokrm9Es-F89bCSdlecKiWpD-5W9VWxikd30";
const PRIVATE_VAPID = "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgnpVRmd797XsY0MBpFsC5ZU6PDvMO2DzEPlwVSVoUmJ2hRANCAARE9PlWZ86ihJI1iuay7LEfdMPv7iglyparS0m3ZEcXzuCm1nGKK6JK5vRLPhfPWwknZXnColqQ_uVvVVsYpHd9";

webpush.setVapidDetails("mailto:admin@example.com", PUBLIC_VAPID, PRIVATE_VAPID);

let subscriptions = [];
let drugs = [];

app.post("/push/subscribe", (req, res) => { subscriptions.push(req.body); res.sendStatus(201); });
app.post("/drugs/update", (req, res) => { drugs = req.body; res.sendStatus(200); });

setInterval(() => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const current = `${hh}:${mm}`;
    drugs.forEach(drug => {
        if (drug.time === current) {
            const payload = JSON.stringify({ title: drug.name, body: `Godzina podania: ${drug.time}` });
            subscriptions.forEach(sub => { webpush.sendNotification(sub, payload).catch(err => console.error(err)); });
        }
    });
}, 60000);

app.listen(3000, () => console.log("Push server działa na porcie 3000"));
