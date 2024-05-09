const path = require('path');
const { app, BrowserWindow, Menu } = require('electron');

const isMac = process.platform === 'darwin'

if (require('electron-squirrel-startup')) app.quit();

function createMainWindow() {
    const mainWindow = new BrowserWindow({
        title: 'Binart',
        width: 1310,
        height: 950,
        icon: "assets/icon.ico"
    });

    mainWindow.loadFile(path.join(__dirname, './index.html'));
}

function createAboutWindow() {
    require("electron").shell.openExternal("https://github.com/ilayezra/Binart");
}

app.whenReady().then(() => {
    createMainWindow();

    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow()
        }
    })
});

const menu = [
    ...(isMac ? [{
        label: app.name,
        sunmenu: [
            {
                label: 'About',
                click: createAboutWindow
            }
        ]
    }] : []),
    {
        role: 'fileMenu',
    },
    ...(!isMac ? [{
        label: 'Help',
        submenu: [{
            label: 'About',
            click: createAboutWindow
        }]
    }] : [])
];

app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit()
    }
})