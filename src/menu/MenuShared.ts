import type { Game } from "../Game"

export enum MenuCSSProperty {
    MAIN_MENU = "--mainMenuDisplay",
    CHOOSE_CAR = "--chooseCarMenuDisplay",
    SETTINGS = "--settingsMenuDisplay",
    GAME_CANVAS = "--gameCanvasDisplay",
    PAUSE = "--pauseMenuDisplay",
    NEXT_RACE_CONTAINER = "--nextRaceContainerDisplay",
    GP_FINISH_BUTTON_CONTAINER = "--gpFinishButtonContainerDisplay",
    GP_FINAL_RESULTS_MENU = "--gpFinalResultsMenuDisplay"
}

export const setMenuInvisible = (cssProperty: MenuCSSProperty) => {
    // document.documentElement.style.removeProperty(cssProperty)
    document.documentElement.style.setProperty(cssProperty, "none")
}

export const setMenuVisible = (cssProperty: MenuCSSProperty, game: Game) => {
    if (cssProperty === MenuCSSProperty.GAME_CANVAS) {
        game.gameCanvas.focus()
    }
    document.documentElement.style.setProperty(cssProperty, "flex")
}