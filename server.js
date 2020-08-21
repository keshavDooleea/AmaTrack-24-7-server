const express = require("express");
const startTracking = require("./index");

const app = express();
const PORT = process.env.PORT || 5000;

startTracking();

app.get("/", (req, res) => {
    res.json({
        status: "Server up and running"
    });
})

app.listen(PORT, () => console.log(`listening on port ${PORT}`));