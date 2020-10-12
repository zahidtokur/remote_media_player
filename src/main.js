const { rejects } = require("assert");
const { app, BrowserWindow, ipcMain } = require("electron");
const { response } = require("express");
const fs = require("fs");
var timer = require("timer")
var express = require("express"),
  path = require("path"),
  service = express();

//***************************************************************//
//***************************************************************//
//***********************   ELECTRON  ***************************//
//***************************************************************//
//***************************************************************//
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    frame: true,
    fullscreen: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadFile("../window/window.html");
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();
});
// .then(() => {
//   mainWindow.webContents.on("did-finish-load", () => {
//     fs.readdir(path.join(__dirname, "./media"), function (err, dir) {
//       if (err) rejects(err);
//       else {
//         mainWindow.webContents.send("files", dir);
//       }
//     });
//   });
// });

//***************************************************************//
//***************************************************************//
//***********************   SERVICES  ***************************//
//***************************************************************//
//***************************************************************//

let MyPlayer = new Player();

service.set("port", process.env.PORT || 3000);
service.use(express.static("public"));
service.listen(service.get("port"), function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log("Running on port: " + service.get("port"));
  }
});
service.use(
  express.urlencoded({
    extend: false,
  })
);
service.use(express.json());

service.post("/upload/:filename", function (req, res) {
  var filename = path.basename(req.params.filename);
  filename = path.resolve("window/media", filename);
  var dst = fs.createWriteStream(filename);
  req.pipe(dst);
  dst.on("drain", function () {
    console.log("Yukleniyor... ", new Date());
    req.resume();
  });
  req.on("end", function () {
    console.log("Tamamlandi...");
    MyPlayer.add(new Media(filename, 5));
    // mainWindow.webContents.send("file", filename);
    res.sendStatus(200);
  });
});

service.post("/brightness", function (req, res) {
  mainWindow.webContents.send("brightness", req.body.brightness);
  res.end("success");
  console.log(MyPlayer);
});

service.post("/play", function (req, res) {
  res.end("success");
  MyPlayer.start(mainWindow);
});

function Media(myFileName, myLength) {
  this.id = Math.random().toString(36).slice(2);
  this.fileName = myFileName;
  this.duration = myLength;

  this.print = function () {
    console.log(this.id + "  " + this.fileName + " " + this.duration);
  };
  this.play = function (mainWindow) {
    mainWindow.webContents.send("file", this.fileName);
  };
}

function Player() {
  this.count = 0;
  this.play = false;
  this.loop = false;
  this.array = [];
  this.add = function (object) {
    this.array[this.count] = object;
    this.count++;
  };
  this.start =function (mainWindow) {
    let index = 0;
    this.play = true;
    while (this.play) {
      console.log(
        "index: " + index + " Count: " + this.count + " loop: " + this.loop
      );
      timer(this.array[index].duration)
      this.array[index].play(mainWindow);
      if (this.loop && index == this.count - 1) index = 0;
      else if (!this.loop && index == this.count - 1) this.play = false;
      else if (index <= this.count - 1) index++;
    }
  };
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}   