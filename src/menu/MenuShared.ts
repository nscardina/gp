import type { Game } from "../Game"

export enum MenuCSSProperty {
    MAIN_MENU = "--mainMenuDisplay",
    CHOOSE_CAR = "--chooseCarMenuDisplay",
    SETTINGS = "--settingsMenuDisplay",
    GAME_CANVAS = "--gameCanvasDisplay",
    PAUSE = "--pauseMenuDisplay"
}

export const setMenuInvisible = (cssProperty: MenuCSSProperty) => {
    document.documentElement.style.setProperty(cssProperty, "none")
}

export const setMenuVisible = (cssProperty: MenuCSSProperty, game: Game) => {
    if (cssProperty === MenuCSSProperty.GAME_CANVAS) {
        game.gameCanvas.focus()
    }
    document.documentElement.style.setProperty(cssProperty, "flex")
}