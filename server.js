require("dotenv").config();
const express = require("express");
const mongo = require("mongoose");
const email = require("./index");
let dateFormat = require('dateformat');

const app = express();
const PORT = process.env.PORT || 8080;

// Mongo connection
mongo.connect(process.env.MONGODB_URI || process.env.DB_CONNECTION,
    { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false },
    () => console.log("connected to DB!"));

email.startTracking();

app.get("/", async (req, res) => {
    let info = await email.getStatus();
    let now = new Date();

    info.lastCheckedServer = dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT");;
    res.json(info);
})

app.listen(PORT, () => console.log(`listening on port ${PORT}`));