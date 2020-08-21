require("dotenv").config();
const axios = require("axios");
const cheerio = require("cheerio");
let mailer = require("nodemailer");
let CronJob = require("cron").CronJob;

// const URL = "https://en.wikipedia.org/wiki/Arsenal_F.C.";
const URL =
  "https://www.amazon.ca/Nintendo-Switch-Neon-Blue-Joy%E2%80%91/dp/B07VGRJDFY/";

// get page source contents
async function getProduct() {
  // make http request to get source content
  try {
    const { data } = await axios.get(URL);
    const $ = cheerio.load(data); // load html
    const stockNb = getNumber($(".a-size-medium.a-color-success").text());
    const price = getNumber(
      $("#priceblock_ourprice.a-size-medium.a-color-price").text()
    );

    console.log(stockNb);
    console.log(price);

    sendMail(price, stockNb);
  } catch (err) {
    console.log("error");
  }
}

// extracts number from text/string
function getNumber(string) {
  return string.match(/\d+(?:\.\d+)?/g).join("");
}

async function sendMail(price, stockNb) {
  let transporter = mailer.createTransport({
    host: "smtp.mail.yahoo.com",
    port: 465,
    service: "yahoo",
    auth: {
      user: "rkdooleea@yahoo.com",
      pass: process.env.PASSWORD,
    },
  });

  // let html = `<div>Nb in stock: ${stockNb}</div>
  // <div><a href=${URL}>LINK</a></div>`;

  // let mail = {
  //   from: "rkdooleea@yahoo.com",
  //   to: "kdooleea@yahoo.ca",
  //   subject: `Nintento price: $${price}`,
  //   text: `Price is now ${price}`,
  //   html: html,
  // };

  let html = `<div 
  style="background-color: rosybrown;
        width: 95%;
        height: 100%;
        box-sizing: border-box;
        padding: 15px 25px 15px 20px;
        box-shadow: -12px -12px 30px 5px rgba(255, 255, 255, 0.9),
          12px 12px 30px 5px rgba(50, 58, 73, 0.2);
        border-radius: 15px;
        font-family: Comic Sans MS, cursive, sans-serif;">
  <p 
  style="color: #f5f6f7;
  text-align: center;
  letter-spacing: 2px;"
  >I miss you 😢</p>
  <p
  style="color: #f5f6f7;
  text-align: center;
  letter-spacing: 2px;"
  >❤️ I love you!</p>
</div>`;

  let mail = {
    from: "rkdooleea@yahoo.com",
    to: "kdooleea@yahoo.ca",
    subject: "Babe 😞",
    text: `kissy? 😘`,
    html: html,
  };

  await transporter.sendMail(mail, (error, info) => {
    error
      ? console.log(`EMAIL ERROR: ${error}`)
      : console.log(`EMAIL SENT SUCCESSFULLY: ${info.response}`);
  });
}

// runs code repeatedly over an interval
function startTracking() {
  const interval = 30; // min

  let job = new CronJob(
    `*/${interval} * * * *`,
    async () => {
      await getProduct();
    },
    null,
    true,
    null,
    null,
    true
  );
  job.start();
}

startTracking();
