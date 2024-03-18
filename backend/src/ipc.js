/* 
	Copyright (C)2022 netangular.com
	Author: Daniel Vanderloo <daniel@netangular.com>
*/


/* Preload (Isolated World) */
const {contextBridge, ipcRenderer} = require("electron");


/* Expose protected methods that allow the renderer process to use */
/* the ipcRenderer without exposing the entire object */
contextBridge.exposeInMainWorld(
    "api", {
        send: (channel, args) => {
            // whitelist channels
            let validChannels = [
				"readdir",
				"readfile",
				"startup",
				"tree-init",
				"config-update",
				"openfile",
				"savefile",
				"controls",
				"upload",
				"tree-node",
				"project-delete"
			];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, args);
            }
        },
        sendSync: (channel, args) => {
			return ipcRenderer.sendSync(channel, args);
        },
        on: (channel, callback) => {
            let validChannels = [
				"startup-data",
				"readdir-data",
				"readfile-data",
				"tree-init-data",
				"config-update-data",
				"openfile-data",
				"savefile-data",
				"upload-data",
				"tree-node-data",
				"project-delete-data",
				"auth-info"
			];
            if (validChannels.includes(channel)) {
                ipcRenderer.on(channel, callback);
            }
        }
    }
);