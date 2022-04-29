// main.js
"use strict"

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const net = require('net');

class ElevatorIO {
    constructor() {
        this._inputState = 0x08 | 0x02
		this._outputState = {
			doorMotor: false,
			doorRatio: 0,
			liftMotor: false,
			liftRatio: 0,
			upstairCallButtonLamp: false,
			upstairRequestButtonLamp: false,
			downstairRequestButtonLamp: false,
			downstairCallButtonLamp: false 
		}
		this._sensorState = {
			isDoorOpenSensorOn: false,
			isDoorCloseSensorOn: true,
			isLiftUpstairSensorOn: false,
			isLiftDownstairSensorOn: true 
		}
    }
    
    get inputState() {
        return this._inputState
    }

	get outputState() {
		return this._outputState
	}

	get sensorState() {
		return this._sensorState
	}

    liftUpstairSensorOn() {
        this._inputState |= 0x01 
		this._sensorState.isLiftUpstairSensorOn = true
    }

    liftUpstairSensorOff() {
        this._inputState &= ~0x01
		this._sensorState.isLiftUpstairSensorOn = false
    }

    liftDownstairSensorOn() {
        this._inputState |= 0x02
		this._sensorState.isLiftDownstairSensorOn = true
    }

    liftDownstairSensorOff() {
        this._inputState &= ~0x02
		this._sensorState.isLiftDownstairSensorOn = false
    }

    doorOpenSensorOn() {
        this._inputState |= 0x04
		this._sensorState.isDoorOpenSensorOn = true
    }

    doorOpenSensorOff() {
        this._inputState &= ~0x04
		this._sensorState.isDoorOpenSensorOn = false
    }

    doorCloseSensorOn() {
        this._inputState |= 0x08
		this._sensorState.isDoorCloseSensorOn = true
    }

    doorCloseSensorOff() {
        this._inputState &= ~0x08
		this._sensorState.isDoorCloseSensorOn = false
    }

    upstairCallButtonOn() {
        this._inputState |= 0x10 
    }

    upstairCallButtonOff() {
        this._inputState &= ~0x10 
    }

    downstairCallButtonOn() {
        this._inputState |= 0x20 
    }

    downstairCallButtonOff() {
        this._inputState &= ~0x20
    }

    upstairRequestButtonOn() {
        this._inputState |= 0x40 
    }

    upstairRequestButtonOff() {
        this._inputState &= ~0x40
    }

    downstairRequestButtonOn() {
        this._inputState |= 0x80
    }

    downstairRequestButtonOff() {
        this._inputState &= ~0x80
    }

	updateDoorStateForOpen() {
		this.doorCloseSensorOff()
		if (this._outputState.doorRatio < 1000) {
			this._outputState.doorRatio += 4;
		}
		if (this._outputState.doorRatio === 1000) {
			this.doorOpenSensorOn()
		}
	}

	updateDoorStateForClose() {
		this.doorOpenSensorOff()
		if (this._outputState.doorRatio > 0) {
			this._outputState.doorRatio -= 4;
		}
		if (this._outputState.doorRatio === 0) {
			this.doorCloseSensorOn()
		}
	}

	updateLiftStateForUp() {
		this.liftDownstairSensorOff()
		if (this._outputState.liftRatio < 1000) {
			this._outputState.liftRatio += 4;
		}
		if (this._outputState.liftRatio === 1000) {
			this.liftUpstairSensorOn()
		}
	}

	updateLiftStateForDown() {
		this.liftUpstairSensorOff()
		if (this._outputState.liftRatio > 0) {
			this._outputState.liftRatio -= 4;
		}
		if (this._outputState.liftRatio === 0) {
			this.liftDownstairSensorOn()
		}
	}

	updateState(x) {
		const temp = Number.parseInt(x)
		if ((temp & 1) === 1) {
			this.updateLiftStateForUp()
			this._outputState.liftMotor = true
		}
		else if ((temp & 2) === 2) {
			this.updateLiftStateForDown()
			this._outputState.liftMotor = true
		}
		else {
			this._outputState.liftMotor = false
		}

		if ((temp & 4) === 4) {
			this.updateDoorStateForOpen()
			this._outputState.doorMotor = true
		}
		else if ((temp & 8) === 8) {
			this.updateDoorStateForClose()
			this._outputState.doorMotor = true
		}
		else {
			this._outputState.doorMotor = false
		}

		this._outputState.upstairCallButtonLamp = ((temp & 16) === 16)
		this._outputState.downstairCallButtonLamp = ((temp & 32) === 32)
		this._outputState.upstairRequestButtonLamp = ((temp & 64) === 64)
		this._outputState.downstairRequestButtonLamp = ((temp & 128) === 128)
	}
}

const elevatorIO = new ElevatorIO()

let mainWindow

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 940,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('index.html');
    // mainWindow.webContents.openDevTools();
}

app.whenReady().then(()=> {
    createWindow();

    app.on('activate', function() {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') app.quit()
});

ipcMain.on('UpstairCallButtonPressed', (event, args) => {
	elevatorIO.upstairCallButtonOn()
})

ipcMain.on('UpstairCallButtonUnpressed', (event, args) => {
	elevatorIO.upstairCallButtonOff()
})

ipcMain.on('UpstairRequestButtonPressed', (event, args) => {
	elevatorIO.upstairRequestButtonOn()
})

ipcMain.on('UpstairRequestButtonUnpressed', (event, args) => {
	elevatorIO.upstairRequestButtonOff()
})

ipcMain.on('DownstairRequestButtonPressed', (event, args) => {
	elevatorIO.downstairRequestButtonOn()
})

ipcMain.on('DownstairRequestButtonUnpressed', (event, args) => {
	elevatorIO.downstairRequestButtonOff()
})

ipcMain.on('DownstairCallButtonPressed', (event, args) => {
	elevatorIO.downstairCallButtonOn()
})

ipcMain.on('DownstairCallButtonUnpressed', (event, args) => {
	elevatorIO.downstairCallButtonOff()
})

const server = net.createServer((connection) => {
    console.log('connection open.')

    connection.on('data', (data) => {
        try {
			elevatorIO.updateState(data)
            mainWindow.webContents.send('OutputStates', elevatorIO.outputState) 
            mainWindow.webContents.send('SensorStates', elevatorIO.sensorState) 
            connection.write(elevatorIO.inputState.toString())
        }
        catch (e) {
            console.log('application quitting while client connect', e)
        }
    })

    connection.on('close', () => {
        console.log('Connection closed frome client')
    })

}).listen(3000)

// End of File

