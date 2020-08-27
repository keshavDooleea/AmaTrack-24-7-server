require("dotenv").config();
let mailer = require("nodemailer");
let CronJob = require("cron").CronJob;
let dateFormat = require('dateformat');
const axios = require("axios");
const cheerio = require("cheerio");

// mongo schemas
const Product = require("./productSchema").Product;

let emailStatus = {
  lastEmailStatus: "",
  lastSent: "",
  dbSize: 0,
  message: ""
};

// extracts number from text/string
function getNumber(string) {
  return string.match(/\d+(?:\.\d+)?/g).join("");
}

// constantly scraping and getting back the price
async function getPrice(url) {
  let price, shipping;

  const { data } = await axios.get(url);
  const $ = cheerio.load(data); // loads html

  // get title
  const title = $("#productTitle.a-size-large.product-title-word-break").text();

  const priceHtmlTags = [$("#price_inside_buybox.a-size-medium.a-color-price").text(), $("#priceblock_ourprice.a-size-medium.a-color-price").text()];
  priceHtmlTags.forEach(tag => {
    tag !== "" ? price = getNumber(tag) : null;
  });

  // getting shipping costs
  const shippingHtmlTags = [$("#ourprice_shippingmessage .a-color-secondary.a-size-base").text()];
  shippingHtmlTags.forEach(tag => {
    tag !== "" ? shipping = getNumber(tag) : shipping = 0;
  });

  return {
    title,
    price: parseFloat(price) + parseFloat(shipping)
  };
}

async function checkDB() {
  // get all items from db
  await Product.find({}, (err, products) => {
    if (err) {
      console.log(`SERVER 2 ERROR: ${err}`);
      return;
    }

    console.log(products.length);

    products.forEach(async (product) => {
      const data = await getPrice(product.url);
      const currentPrice = data.price;
      const title = data.title;

      if (currentPrice <= product.desiredPrice) {
        await sendMail(product, currentPrice, title, products.length);

        // remove from db
        await Product.findOneAndDelete({ key: product.key });
        console.log(`product removed: ${product}`);
      }
    })
  });
}

async function sendMail(product, currentPrice, title, length) {
  let transporter = mailer.createTransport({
    host: "smtp.mail.yahoo.com",
    port: 465,
    service: "yahoo",
    auth: {
      user: "rkdooleea@yahoo.com",
      pass: process.env.PASSWORD,
    },
  });

  let html =
    ` <div style="
    width: 90%;
    height: 100%;
    box-shadow: -12px -12px 30px 5px rgba(255, 255, 255, 0.9),
      12px 12px 30px 5px rgba(50, 58, 73, 0.2);
    background-color: #f5f6f7;
    border-radius: 15px;
    font-family: Comic Sans MS, cursive, sans-serif;
  ">
    <div
        style="height: 20%; background-color: #232f3e; padding: 15px 25px 15px 20px; box-sizing: border-box; border-radius: 10px 10px 0 0; display: flex; align-items: center;">
        <h3 style="color: rgba(249,225,115,1); letter-spacing: 1.5px;">AmaTrack price drop alert</h3>
    </div>

    <div style="height: 60%; padding: 15px 25px 15px 20px; box-sizing: border-box;">
        <p>Your product's price has been dropped to <span style="color: #0066c0;">${currentPrice}</span>!</p>
        <p style="margin-top: 30px;">Product: <span style="color: #0066c0;">${title}</span></p>
        <p style="margin-top: 15px;">Product link: <a href="${product.url}" style="color: #0066c0;">${product.url}</a></p>
        <p style="margin-top: 15px;">Product's previous price: <span
                style="color: #0066c0;">$${product.actualPrice}</span> </p>
        <p style="margin-top: 15px;">As a result, your item has been removed from the database.<br>You won't be
            receiving alerts for this product again!
        </p>
    </div>
    <div
        style="height: 20%; padding: 15px 25px 15px 20px; box-sizing: border-box; border-radius: 0 0 10px 10px; display: flex; align-items: flex-end; justify-content: flex-end;">
        <small style="color: rosybrown;">Reetesh Dooleea</small>
    </div>
</div>`

  let mail = {
    from: "rkdooleea@yahoo.com",
    to: `${product.email}`,
    subject: `Amazon Price drop!`,
    html: html,
  };

  await transporter.sendMail(mail, (error, info) => {
    let now = new Date();

    if (error) {
      console.log(`EMAIL ERROR: ${error}`);
      emailStatus = {
        lastEmailStatus: error,
        lastSent: dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT"),
        dbSize: length - 1,
        message: "Server crashed!"
      }
    } else {
      console.log(`EMAIL SENT SUCCESSFULLY: ${info.response}`);
      emailStatus = {
        lastEmailStatus: info.response,
        lastSent: dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT"),
        dbSize: length - 1,
        message: "Server up and running!"
      }
    }
  });
}

// runs code repeatedly over an interval
async function startTracking() {
  const interval = 30; // min

  let job = new CronJob(
    // `*/${interval} * * * *`,
    `*/15 * * * * *`,
    () => {
      checkDB();
    },
    null,
    true,
    null,
    null,
    true
  );
  job.start();
}

function getStatus() {
  return emailStatus;
}

exports.startTracking = startTracking;
exports.getStatus = getStatus;
