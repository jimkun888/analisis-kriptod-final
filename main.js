const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const ALLOW = ['api.coingecko.com', 'api.alternative.me', 'min-api.cryptocompare.com'];

ipcMain.handle('get', async (e, url) => {
  const u = new URL(url);
  if (u.protocol !== 'https:' || !ALLOW.includes(u.hostname)) throw new Error('blocked');
  const r = await fetch(url, { headers: { accept: 'application/json' } });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
});

function createWindow() {
  const w = new BrowserWindow({
    width: 1200, height: 860, backgroundColor: '#151514', title: 'Crypto Analyzer',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
  });
  w.setMenuBarVisibility(false);
  w.loadFile('index.html');
  w.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
}
app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
