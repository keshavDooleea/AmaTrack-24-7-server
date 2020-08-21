const express = require("express");
const email = require("./index");
let dateFormat = require('dateformat');

const app = express();
const PORT = process.env.PORT || 5000;

email.startTracking();

app.get("/", async (req, res) => {
    let info = await email.getStatus();
    let now = new Date();

    info.lastCheckedServer = dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT");;
    res.json(info);
})

app.listen(PORT, () => console.log(`listening on port ${PORT}`));