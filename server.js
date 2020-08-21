const express = require("express");
const email = require("./index");

const app = express();
const PORT = process.env.PORT || 5000;

email.startTracking();

app.get("/", async (req, res) => {
    let info = await email.getStatus();
    info.lastChexked = new Date().toLocaleString();
    res.json(info);
})

app.listen(PORT, () => console.log(`listening on port ${PORT}`));