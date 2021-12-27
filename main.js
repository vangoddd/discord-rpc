const { app, Menu, BrowserWindow, Tray, ipcMain } = require("electron");
const path = require("path");
const url = require("url");
const DiscordRPC = require("./node_modules/discord-rpc");
require("dotenv").config();

let mainWindow, tray;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 400,
    webPreferences: {
      preload: path.join(app.getAppPath(), "renderer.js"),
    },
  });

  mainWindow.loadFile("index.html");

  mainWindow.on("minimize", () => {
    mainWindow.hide();
    if (!tray) createTray();
  });
}

function showWindow() {
  if (!mainWindow.isVisible() || !mainWindow.isFocused()) mainWindow.show();
}

function quitApp() {
  console.log("quitting app");
  app.quit();
}

function createTray() {
  tray = new Tray("./icon.png");
  const contextMenu = Menu.buildFromTemplate([
    { label: "Restore main window", type: "normal", click: showWindow },
    { label: "Quit app", type: "normal", click: quitApp },
  ]);
  tray.setToolTip("Simple RPC");
  tray.setContextMenu(contextMenu);
  tray.on("click", () => {
    showWindow();
  });
}

app.whenReady().then(() => {
  createWindow();
  // createTray();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

//
const http = require("http");
const { type } = require("os");
const host = "localhost";
const port = 8000;

let songTitle = "Song title";
let songArtist = "Artist";
let songData = null;
let tempSongData = null;
let songTime = null;
let songUrl = null;
let endTime = Date.now();
let packetTime = Date.now();

const requestListener = function (req, res) {
  if (req.method === "POST") {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      console.log(JSON.parse(data)); // 'Buy the milk'
      // songTitle = JSON.parse(data).title;
      songData = JSON.parse(data);
      packetTime = Date.now();
      res.end();
    });
    res.writeHead(200);
    res.end("Post received!");
  }
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});

function minuteToSecond(time) {
  let info = time.split(":");
  let timeInSecond = Number(info[0]) * 60 + Number(info[1]);
  return timeInSecond;
}

function cutUrl(url) {
  let newUrl = url.substr(0, url.indexOf("&list"));
  if (!newUrl) {
    return url;
  } else {
    return newUrl;
  }
}

//

ipcMain.on("title", (event, arg) => {
  if (arg == "getTitle") {
    event.reply("title", songData);
  }
});

const clientId = process.env.CLIENT_ID;

DiscordRPC.register(clientId);

const rpc = new DiscordRPC.Client({ transport: "ipc" });
const startTimestamp = new Date();

async function setActivity() {
  if (!rpc || !mainWindow) {
    return;
  }
  let buttonOne = {
    label: "Listen",
    url: "https://music.youtube.com/watch?v=jb4ybTQwcdw",
  };

  if (songData !== null) {
    songUrl = songData.url;
    buttonOne = { label: "Listen", url: cutUrl(songUrl) };
    songTitle = songData.title;
    songArtist = songData.artist;
    songTime = songData.time.split(/\s|\/|[\\n]/).filter(Boolean);
    let delta = Math.abs(
      minuteToSecond(songTime[1]) - minuteToSecond(songTime[0])
    );
    let now = Date.now();
    endTime = now + delta * 1000 - (now - packetTime);
  }

  // You'll need to have snek_large and snek_small assets uploaded to
  // https://discord.com/developers/applications/<application_id>/rich-presence/assets
  rpc.setActivity({
    details: `${songTitle}`,
    state: `${songArtist}`,
    startTimestamp,
    endTimestamp: endTime,
    largeImageKey: "chen_wpp_bw_-_copy",
    largeImageText: "chen",
    smallImageKey: "chen_wpp_bw_-_copy_0_5x",
    smallImageText: "chen",
    buttons: [buttonOne],
    instance: false,
  });
}

async function setIdle() {
  if (!rpc || !mainWindow) {
    return;
  }

  rpc.setActivity({
    state: `Idle`,
    largeImageKey: "chen_wpp_bw_-_copy",
    largeImageText: "chen",
    smallImageKey: "chen_wpp_bw_-_copy_0_5x",
    smallImageText: "chen",
    instance: false,
  });
}

rpc.on("ready", () => {
  if (songData == null) {
    setIdle();
  }
  setInterval(() => {
    console.log("interval");
    if (songData != tempSongData) {
      tempSongData = songData;
      setActivity();
    } else {
      setIdle();
    }
  }, 15e3);
});

rpc.login({ clientId }).catch(console.error);
