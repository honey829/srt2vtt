const express = require("express");
const app = express();
const cors = require("cors");
const multer = require("multer");
const bodyParser = require("body-parser");
const upload = multer({ dest: "upload/" });
const fs = require("fs");
const srt2vtt = require("srt-to-vtt");
const webvtt = require("node-webvtt");

const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var dataFile = {
  file: "",
  name: ""
};

app.get("/", (req, res) => {
  res.send("Home");
});

app.post("/uploadSrt", upload.any(), (req, res) => {
  console.log(req);

  dataFile = {
    file: req.files[0]
  };
  // console.log(req.files[0]);
  let path = dataFile.file.path;

  fs.createReadStream(path)
    .pipe(srt2vtt())
    .pipe(fs.createWriteStream("./subtitleToVtt"));

  var file = "";

  try {
    const stream = fs.createReadStream("./subtitleToVtt", "utf-8");

    stream.on("data", (chunk) => {
      file += chunk;
    });
    stream.on("end", () => {
      console.log(`read complete`);
      const parser = webvtt.parse(file.toString(), { strict: false });
      const compile = webvtt.compile(parser);
      res.send(compile);
    });
  } catch (error) {
    res.send(error);
  }
});

app.listen(port, () => {
  console.log(`listening at ${port}`);
});
