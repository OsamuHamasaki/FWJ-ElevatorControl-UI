// renderer.js
"use strict"

class Widget {
    constructor(id) {
        this._element = document.getElementById(id)
    }
}

class Box extends Widget {
    constructor(id) {
        super(id)
        this._context = this._element.getContext("2d")
        this.drawFrame()
        this.off()
    }

    drawFrame(color) {
        this._context.fillStyle = color 
        this._context.fillRect(0, 0, this._element.width, this._element.height)
    }

    off() {
        this.drawFrame("gray")
    }

    on() {
        this.drawFrame("orange")
    }
}

class ClickableBox extends Box {
    constructor(id) {
        super(id)
		this.initialize()
    }

	initialize() {
		this._element.addEventListener("mousedown",
			(e) => {
				this._mouseDownHandler(e)
				document.addEventListener("mouseup",
					(e) => {
						this._mouseUpHandler(e)
					},
					{ once: true })
			})
	}

	onMouseDown(f) {
		this._mouseDownHandler = f
	}

	onMouseUp(f) {
		this._mouseUpHandler = f
	}
}

class HorizontalGuage extends Widget {
    constructor(id) {
        super(id)
        this._context = this._element.getContext("2d")
        this.drawFrame()
    }

    drawFrame(moving) {
        this._context.fillStyle = moving ? "red" : "gray"
        this._context.fillRect(0, 0, this._element.width, this._element.height)
    }

	update(moving, ratio) {
		this.drawFrame(moving)
		this._context.fillStyle = moving ? "orange" : "green"
		this._context.fillRect(0, 0, this._element.width * ratio, this._element.height)
	}
}

class VirticalGuage extends Widget {
    constructor(id) {
        super(id)
        this._context = this._element.getContext("2d")
        this.drawFrame()
    }

    drawFrame(moving) {
        this._context.fillStyle = moving ? "red" : "gray"
        this._context.fillRect(0, 0, this._element.width, this._element.height)
    }

	update(moving, ratio) {
		this.drawFrame(moving)
		this._context.fillStyle = moving ? "orange" : "green"
		this._context.fillRect(0, this._element.height * (1 - ratio), this._element.width, this._element.height)
	}
}

const upstairCallButton = new ClickableBox("UpstairCallButton")
upstairCallButton.onMouseDown((e)=> { window.api.notifyUpstairCallButtonPressed() })
upstairCallButton.onMouseUp((e)=> { window.api.notifyUpstairCallButtonUnpressed() })

const upstairRequestButton = new ClickableBox("UpstairRequestButton")
upstairRequestButton.onMouseDown((e)=> { window.api.notifyUpstairRequestButtonPressed() })
upstairRequestButton.onMouseUp((e)=> { window.api.notifyUpstairRequestButtonUnpressed() })

const downstairRequestButton = new ClickableBox("DownstairRequestButton")
downstairRequestButton.onMouseDown((e)=> { window.api.notifyDownstairRequestButtonPressed() })
downstairRequestButton.onMouseUp((e)=> { window.api.notifyDownstairRequestButtonUnpressed() })

const downstairCallButton = new ClickableBox("DownstairCallButton")
downstairCallButton.onMouseDown((e)=> { window.api.notifyDownstairCallButtonPressed() })
downstairCallButton.onMouseUp((e)=> { window.api.notifyDownstairCallButtonUnpressed() })

const doorCloseSensor = new Box("DoorCloseSensor")
const doorOpenSensor = new Box("DoorOpenSensor")
const liftUpstairSensor = new Box("LiftUpstairSensor")
const liftDownstairSensor = new Box("LiftDownstairSensor")

const door = new HorizontalGuage("Door")
const lift = new VirticalGuage("Lift")

window.api.outputStates(({doorMotor, doorRatio, liftMotor, liftRatio, upstairCallButtonLamp, upstairRequestButtonLamp, downstairRequestButtonLamp, downstairCallButtonLamp}) => {
	door.update(doorMotor, doorRatio / 1000)
	lift.update(liftMotor, liftRatio / 1000)

	if (upstairCallButtonLamp) {
		upstairCallButton.on()
	}
	else
	{
		upstairCallButton.off()
	}

	if (upstairRequestButtonLamp) {
		upstairRequestButton.on()
	}
	else {
		upstairRequestButton.off()
	}

	if (downstairRequestButtonLamp) {
		downstairRequestButton.on()
	}
	else {
		downstairRequestButton.off()
	}

	if (downstairCallButtonLamp) {
		downstairCallButton.on()
	}
	else {
		downstairCallButton.off()
	}
})

window.api.sensorStates(({isDoorOpenSensorOn, isDoorCloseSensorOn, isLiftUpstairSensorOn, isLiftDownstairSensorOn}) => {
	if (isDoorOpenSensorOn) {
		doorOpenSensor.on()
	}
	else
	{
		doorOpenSensor.off()
	}

	if (isDoorCloseSensorOn) {
		doorCloseSensor.on()
	}
	else {
		doorCloseSensor.off()
	}

	if (isLiftUpstairSensorOn) {
		liftUpstairSensor.on()
	}
	else {
		liftUpstairSensor.off()
	}

	if (isLiftDownstairSensorOn) {
		liftDownstairSensor.on()
	}
	else {
		liftDownstairSensor.off()
	}
})

// End of File

