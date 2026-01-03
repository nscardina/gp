import type { KeybindMap } from "./keybind/Keyboard"
import { makeDefaultKeybindMap, setKeyListener } from "./keybind/Keyboard"
import { setupChooseCarMenu } from "./menu/ChooseCarMenu"
import { setupMainMenu } from "./menu/MainMenu"
import { MenuCSSProperty, setMenuInvisible, setMenuVisible } from "./menu/MenuShared"
import { setupPauseMenu } from "./menu/PauseMenu"
import { IPCInitGPMessage, IPCRespawnStartMessage, IPCSetPauseStateMessage } from "./multithreading/IPC"
import { CarImagePath } from "./physics/Car"

export class Game {

	paused: boolean

	/**
	 * HTML canvas element that the game is drawn to.
	 */
	gameCanvas: HTMLCanvasElement

	/**
	 * 2D context of the game canvas.
	 */
	gameCanvasContext: CanvasRenderingContext2D

	/**
	 * Worker for the GameWorker file.
	 */
	worker: Worker

	debugTextElement: HTMLSpanElement

	/**
	 * Maps the keybind names to the internal JavaScript names 
	 * of the bound keys.
	 */
	keybindMap: KeybindMap

	constructor(gameCanvasId: string) {

		this.paused = false
		this.gameCanvas = _getGameCanvasHTMLElement(gameCanvasId)
		this.gameCanvasContext = _getGameCanvas2DContext(this.gameCanvas)
		this.gameCanvasContext.imageSmoothingEnabled = false

		this.debugTextElement = document.getElementById("debugText") as HTMLSpanElement

		this.keybindMap = makeDefaultKeybindMap()
		
		this.worker = new Worker(new URL('./multithreading/GameWorker.ts', import.meta.url), {
			type: "module"
		})

		setKeyListener(this.keybindMap, this.worker, this)

		// Listen for rendered frames from the worker
		this.worker.onmessage = (e) => {
			if (e.data.type === "render") {
				const { bitmap } = e.data;

				this.gameCanvasContext.save()
				this.gameCanvasContext.scale(4, 4)
				this.gameCanvasContext.drawImage(bitmap, 0, 0);
				this.gameCanvasContext.restore()

				// Close the bitmap to free up GPU memory
				bitmap.close();
			}

			if (e.data.type === "debugText") {
				this.debugTextElement.innerHTML = e.data.text
			}

			if (e.data.type === IPCRespawnStartMessage) {
				this.gameCanvas.classList.add("gp-respawn-fadeout")
				setTimeout(() => this.gameCanvas.classList.remove("gp-respawn-fadeout"), 1000)
			}
			
		};

		this.worker.postMessage({ type: 'START', width: this.gameCanvas.width, height: this.gameCanvas.height });

	}

	initGP(color: CarImagePath) {
		this.worker.postMessage({type: IPCInitGPMessage, carColor: color})
	}

	togglePause() {
		this.paused = !this.paused;
		if (this.paused) {
			setMenuVisible(MenuCSSProperty.PAUSE, this)
		} else {
			setMenuInvisible(MenuCSSProperty.PAUSE)
		}
		this.worker.postMessage({type: IPCSetPauseStateMessage, paused: this.paused})
	}

}

/**
 * Obtains the canvas HTML element with the specified ID, or 
 * throws an error if a canvas element doesn't exist on the 
 * page with that id.
 * @param id id of the canvas element.
 * @returns canvas element's HTMLCanvasElement object.
 */
function _getGameCanvasHTMLElement(id: string): HTMLCanvasElement {
	const gameCanvasHTMLElement = document.getElementById(id)
	if (!(gameCanvasHTMLElement instanceof HTMLCanvasElement)) {
		throw `Error: HTML element id "${id}" is not a canvas`
	}
	return gameCanvasHTMLElement
}

/**
 * Obtains the 2D context of the specified canvas HTML element,
 * or throws an error if something goes wrong getting the context.
 * @param canvas canvas element.
 * @returns 2D context.
 */
function _getGameCanvas2DContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
	const potentiallyNullCanvas = canvas.getContext("2d")
	if (potentiallyNullCanvas === null) {
		throw `Error creating gameCanvas context`
	}
	return potentiallyNullCanvas
}

let _gameObject: Game | null = null;

document.addEventListener("DOMContentLoaded", () => {
	_gameObject = new Game("gameCanvas")

	setupMainMenu(_gameObject)
	setupChooseCarMenu(_gameObject)
	setupPauseMenu(_gameObject)
})

export const gameObject = () => _gameObject