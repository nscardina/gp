import type { Game } from "../Game"
import { MenuCSSProperty, setMenuInvisible, setMenuVisible } from "./MenuShared"

export const setupMainMenu = (game: Game) => {
    const playButton = document.getElementById("mainMenuPlayButton") as HTMLButtonElement
    playButton.addEventListener("click", () => {
        setMenuInvisible(MenuCSSProperty.MAIN_MENU)
        setMenuVisible(MenuCSSProperty.CHOOSE_CAR, game)
    })

    // const settingsButton = document.getElementById("mainMenuSettingsButton") as HTMLButtonElement
    // settingsButton.addEventListener("click", () => {
    //     setMenuInvisible(MenuCSSProperty.MAIN_MENU)
    //     setMenuVisible(MenuCSSProperty.SETTINGS, game)
    // })
}