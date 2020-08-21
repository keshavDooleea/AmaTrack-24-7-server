const express = require("express");
const email = require("./index");

const app = express();
const PORT = process.env.PORT || 5000;

email.startTracking();

app.get("/", (req, res) => {
    res.json(email.getStatus());
})

app.listen(PORT, () => console.log(`listening on port ${PORT}`));