require('dotenv').config();
const express = require('express');
const dns = require("dns");
const cors = require('cors');
const app = express();

const fs = require("fs");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

const DB_FILE = "./urls.json";
let urls = [];
if (fs.existsSync(DB_FILE)) {
  urls = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

app.post("/api/shorturl", function (req, res) {
  const originalUrl = req.body.url;

  let parsedUrl;
  console.log("TRIED: " + originalUrl);

  try {
    parsedUrl = new URL(originalUrl);
  } catch (error) {
    return res.json({ error: "invalid url" });
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return res.json({ error: "invalid url" });
  }

  dns.lookup(parsedUrl.hostname, function (err) {
    if (err) {
      return res.json({ error: "invalid url" });
    }

    const shortUrl = urls.length + 1;

    const newUrl = {
      original_url: originalUrl,
      short_url: shortUrl
    };
    urls.push(newUrl);
    fs.writeFileSync(DB_FILE, JSON.stringify(urls, null, 2));

    console.log("SAVED:", newUrl);
    res.json(newUrl);
  });
});


app.get("/api/shorturl/:short_url", function (req, res) {
  const shortUrl = parseInt(req.params.short_url, 10);
  console.log("RECEIVED: " + shortUrl);
  const found = urls.find(item => item.short_url === shortUrl);

  if (!found) {
    console.log("NOT FOUND");
    return res.json({ error: "No short URL found" });
  }

  console.log("FOUND: " + found.short_url);

  //return res.redirect(302, found.original_url);
  console.log("REDIRECTED: " + found.original_url);
  res.redirect(found.original_url);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
