import type { KeybindMap, KeyPressedMap } from "./keybind/Keyboard"
import { makeDefaultKeybindMap, makeKeyPressedMap, setKeyListener } from "./keybind/Keyboard"

class Game {

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

	/**
	 * Maps the keybind names to the internal JavaScript names 
	 * of the bound keys.
	 */
	keybindMap: KeybindMap

	constructor(gameCanvasId: string) {

		this.gameCanvas = _getGameCanvasHTMLElement(gameCanvasId)
		this.gameCanvasContext = _getGameCanvas2DContext(this.gameCanvas)
		this.gameCanvasContext.imageSmoothingEnabled = false

		this.keybindMap = makeDefaultKeybindMap()
		
		this.worker = new Worker(new URL('./multithreading/GameWorker.ts', import.meta.url), {
			type: "module"
		})

		setKeyListener(this.keybindMap, this.worker)
		setKeyListener(this.keybindMap, this.worker)

		// Listen for rendered frames from the worker
		this.worker.onmessage = (e) => {
			const { bitmap } = e.data;

			this.gameCanvasContext.save()
			this.gameCanvasContext.scale(4, 4)
			this.gameCanvasContext.drawImage(bitmap, 0, 0);
			this.gameCanvasContext.restore()

			// Close the bitmap to free up GPU memory
			bitmap.close();
		};

		this.worker.postMessage({ type: 'START', width: this.gameCanvas.width, height: this.gameCanvas.height });

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

const game = new Game("gameCanvas")