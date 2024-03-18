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
				"auth",
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
				"auth-data",
			];
            if (validChannels.includes(channel)) {
                ipcRenderer.on(channel, callback);
            }
        }
    }
);