const express = require("express");
const startTracking = require("./index");

const app = express();
const PORT = process.env.PORT || 5000;

const info = startTracking();

app.get("/", (req, res) => {
    res.json({
        LastEmailStatus: info.emailStatus,
        message: info.message,
    });
})

app.listen(PORT, () => console.log(`listening on port ${PORT}`));