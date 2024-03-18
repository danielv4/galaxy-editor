/* 
	Copyright 2022 NetAngular Technologies Inc. 
	All rights reserved.
	Author: Daniel Vanderloo <daniel@netangular.com>
*/


// npm install -g electron@17.0.0
// cd arch
// npm install
// npm install --save-dev electron-rebuild
// .\node_modules\.bin\electron-rebuild.cmd -v 17.0.0


const { app, BrowserWindow, ipcMain, dialog} = require('electron')
const fs = require('fs');
const path = require('path');
const upath = require('upath');
let Client = require('ssh2-sftp-client');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const {FileSystem} = require('./src/filesystem');
var url = require('url');



// in production disable error dialogs by overriding
dialog.showErrorBox = function(args1, args2) {
    console.log(`${args1}\n${args2}`);
};


const createWindow = () => {
	
	var appData = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");
	appData = upath.toUnix(appData);
	var configPath = appData + '/galaxy/config.json';
	
	// create config
	if (!fs.existsSync(configPath)) {
		fs.mkdirSync(appData + '/galaxy', { recursive: true });
		fs.writeFileSync(configPath, JSON.stringify({"projects":[{"id":"default", "type":"local", "path":"/", "name":"Local Disk"}]}));
	}
	
	var config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
	
	const win = new BrowserWindow({
		width: 1280,
		height: 720,
		frame: false,
		webPreferences: {
			webviewTag: true,
			preload: path.join(__dirname, './src/ipc.js')
		}
	})
	
	// load
	win.loadFile('C:\\Users\\Arch\\Desktop\\typescript\\dist\\index.html')
	//win.loadURL('http://localhost:8080/')

	// devtools
	//win.webContents.openDevTools({ mode: 'detach' });
	
	// connections
	var connections = {};
	var newFiles = {};
	
	
	// readdir tree
	ipcMain.on('controls', (event, args) => {
		if (args.type == "minimize") {
			win.minimize();
		} else if (args.type == "maximize") {
			win.isMaximized() ? win.unmaximize() : win.maximize()
		} else if (args.type == "close") {
			win.close();
		}		
	});	
	
	
	// startup
	ipcMain.on('startup', (event, args) => {
		win.webContents.send('startup-data', config);
	});	
	
	// tree-init
	ipcMain.on('tree-init', (event, args) => {
		
		let filesystem = new FileSystem(args.project);
		connections[args.project.id] = filesystem; 
		filesystem.readdir(args.project.path, function(result) {
			win.webContents.send('tree-init-data', result, args.project);
		});
	});	
	
	
	// readdir tree
	ipcMain.on('readdir', (event, args) => {
		connections[args.project.id].readdir(args.path, function(result) {
			win.webContents.send('readdir-data', {"path":args.path, "files":result});
		});
	});
	
	
	// readfile
	ipcMain.on('readfile', (event, args) => {
		
		connections[args.project.id].readFile(args.path, function(result) {
			result["key"] = args.path;
			win.webContents.send('readfile-data', result);
		});
	});
	
	ipcMain.on('config-update', (event, args) => {
		
		if(args.project) {
			var data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
			if(data.projects) {
				data.projects.push(args.project);
				fs.writeFileSync(configPath, JSON.stringify(data));
				win.webContents.send('config-update-data', data);
			}
		}
	});
	
	// openfile
	ipcMain.on('openfile', (event, args) => {
	
		dialog.showOpenDialog(win, {
			properties: ['openFile']
		}).then(result => {	
			if(result.canceled == false) {
				if(result.filePaths.length > 0) {
					var newPath = path.normalize(result.filePaths[0]);
					newPath = upath.toUnix(newPath);
					let filesystem = new FileSystem({"type":"local"});
					filesystem.readFile(newPath, function(result) {
						result["key"] = newPath;
						result["icon"] = filesystem.resolve(newPath);
						result["eventId"] = args.eventId;
						win.webContents.send('openfile-data', result);
					});
				}
			}
		}).catch(err => {

		});
	});
	
	
	
	// auto save
	
	// savefile
	ipcMain.on('savefile', (event, args) => {	

		var items = url.parse(args.id, true);
		var query = items.query;
		var project_id = query.id;
		var q_type = query.type;
		var filePath = items.pathname;

		if(project_id) {
			if(project_id == 'OPEN') {
				connections["default"].writeFile(filePath, args.value, function(result) {
					win.webContents.send('savefile-data', result);
				});				
			} else {
				if(q_type == 'NEW') {
					
					if(!newFiles[project_id]) {
						var options = {
							title: "Save file",
							defaultPath : path.basename(filePath),
							buttonLabel : "Save",
							filters :[
								{name: 'All Files', extensions: ['*']}
							]
						};

						dialog.showSaveDialog(null, options).then(({ filePath }) => {
							
							newFiles[project_id] = filePath;
							connections["default"].writeFile(filePath, args.value, function(result) {
								win.webContents.send('savefile-data', result);
							});						
						});	
					} else {
						connections["default"].writeFile(newFiles[project_id], args.value, function(result) {
							win.webContents.send('savefile-data', result);
						});
					}				
				} else {
					connections[project_id].writeFile(filePath, args.value, function(result) {
						win.webContents.send('savefile-data', result);
					});					
				}
			}
		}
	});
	
	
	// upload
	ipcMain.on('upload', (event, args) => {	
	
		var dirPath = args.path;
		if(args.folder === undefined) {
			dirPath = path.dirname(args.path);
		}	

		connections[args.project.id].upload(args.project, win, dirPath, args.files).then(() => {
			win.webContents.send('upload-data', {"status":"done", "key":dirPath});
		});
	});
	
	
	// tree node events
	ipcMain.on('tree-node', (event, args) => {

		if(args.type == 'delete') {
			if(args.folder === undefined) {
				connections[args.project.id].deleteFile(args.path, function(result) {
					win.webContents.send('tree-node-data', result);
				});
			} else if(args.folder == true) {
				
			}
		} else if(args.type == 'rename') {

			if(args.folder === undefined) {
				connections[args.project.id].renameFile(args.name, args.path).then(() => {
					//win.webContents.send('tree-node-data', result);
				});
			} else if(args.folder == true) {
				
			}
		}
	});
	
	ipcMain.on('project-delete', (event, args) => {
		
		if(args.id) {
			if(args.id != 'default') {
				var data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
				if(data.projects) {
					data.projects = data.projects.filter(item => item.id !== args.id);
					fs.writeFileSync(configPath, JSON.stringify(data));
					win.webContents.send('project-delete-data', data);
				}
			}
		}		
	});
	
	
	// auth
	ipcMain.on('auth', (event, args) => {	
		
		console.log(args);
		win.webContents.send('auth-info', args);
	});

}


app.whenReady().then(() => {
	createWindow()

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
})


app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit()
})