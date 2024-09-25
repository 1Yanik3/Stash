const { app, BrowserWindow } = require("electron");

const isDev = process.env.NODE_ENV === 'development';

app.whenReady().then(() => {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 810,
    titleBarStyle: "hidden",
    titleBarOverlay: true
  });

  mainWindow.loadURL(isDev ? "http://localhost:5173" : "https://stash.hera.lan");

  mainWindow.on("enter-full-screen", () => {
    mainWindow.webContents.executeJavaScript(
      "window.fullscreenChanged && window.fullscreenChanged(true)"
    );
  });

  mainWindow.on("leave-full-screen", () => {
    mainWindow.webContents.executeJavaScript(
      "window.fullscreenChanged && window.fullscreenChanged(false)"
    );
  });
});

app.on("window-all-closed", app.quit);
