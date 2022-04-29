// preload.js

"use strict"

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld(
    'api',
    {
        notifyUpstairCallButtonPressed: () => ipcRenderer.send('UpstairCallButtonPressed'),
        notifyUpstairCallButtonUnpressed: () => ipcRenderer.send('UpstairCallButtonUnpressed'),
        notifyUpstairRequestButtonPressed: () => ipcRenderer.send('UpstairRequestButtonPressed'),
        notifyUpstairRequestButtonUnpressed: () => ipcRenderer.send('UpstairRequestButtonUnpressed'),
        notifyDownstairRequestButtonPressed: () => ipcRenderer.send('DownstairRequestButtonPressed'),
        notifyDownstairRequestButtonUnpressed: () => ipcRenderer.send('DownstairRequestButtonUnpressed'),
        notifyDownstairCallButtonPressed: () => ipcRenderer.send('DownstairCallButtonPressed'),
        notifyDownstairCallButtonUnpressed: () => ipcRenderer.send('DownstairCallButtonUnpressed'),

        outputStates: (listener) => ipcRenderer.on('OutputStates', (event, arg) => listener(arg)), 
        sensorStates: (listener) => ipcRenderer.on('SensorStates', (event, arg) => listener(arg))
    }
)

