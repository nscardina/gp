import type { Game } from "../Game"
import { IPCTriggerNextRaceButton } from "../multithreading/IPC"
import { MenuCSSProperty, setMenuInvisible, setMenuVisible } from "./MenuShared"

export const setupNextRaceButton = (worker: Worker) => {
    const nextRaceButton = document.getElementById("nextRaceButton") as HTMLButtonElement
    nextRaceButton.addEventListener("click", () => {
        worker.postMessage({type: IPCTriggerNextRaceButton})
        setMenuInvisible(MenuCSSProperty.NEXT_RACE_CONTAINER)
    })
}

export const setupGPFinishButton = (game: Game) => {
    const gpFinishButton = document.getElementById("gpFinishButton") as HTMLButtonElement
    gpFinishButton.addEventListener("click", () => {
        console.log("clicked")
        setMenuInvisible(MenuCSSProperty.GAME_CANVAS)
        setMenuInvisible(MenuCSSProperty.PAUSE)
        setMenuInvisible(MenuCSSProperty.GP_FINISH_BUTTON_CONTAINER)
        console.log("clicked")
        setMenuVisible(MenuCSSProperty.GP_FINAL_RESULTS_MENU, game)
    })
}