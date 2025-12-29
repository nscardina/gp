import type { Game } from "../Game"
import { MenuCSSProperty, setMenuInvisible, setMenuVisible } from "./MenuShared"

export const setupPauseMenu = (game: Game) => {
    const quitButton = document.getElementById("pauseMenuQuitButton") as HTMLButtonElement
    quitButton.addEventListener("click", () => {
        setMenuInvisible(MenuCSSProperty.PAUSE)
        setMenuInvisible(MenuCSSProperty.GAME_CANVAS)
        setMenuVisible(MenuCSSProperty.MAIN_MENU, game)
    })
}