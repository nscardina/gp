import type { Game } from "../Game"
import { CarImagePath } from "../physics/Car"
import { MenuCSSProperty, setMenuInvisible, setMenuVisible } from "./MenuShared"

export const setupChooseCarMenu = (game: Game) => {
    const backButton = document.getElementById("chooseCarMenuBackButton") as HTMLButtonElement
    backButton.addEventListener("click", () => {
        setMenuInvisible(MenuCSSProperty.CHOOSE_CAR)
        setMenuVisible(MenuCSSProperty.MAIN_MENU, game)
    })

    const redKartButton = document.getElementById("chooseCarRedButton") as HTMLButtonElement
    redKartButton.addEventListener("click", () => {
        setMenuInvisible(MenuCSSProperty.CHOOSE_CAR)
        setMenuVisible(MenuCSSProperty.GAME_CANVAS, game)
        game.initGP(CarImagePath.RED)
    })

    const greenKartButton = document.getElementById("chooseCarGreenButton") as HTMLButtonElement
    greenKartButton.addEventListener("click", () => {
        setMenuInvisible(MenuCSSProperty.CHOOSE_CAR)
        setMenuVisible(MenuCSSProperty.GAME_CANVAS, game)
        game.initGP(CarImagePath.GREEN)
    })

    const blueKartButton = document.getElementById("chooseCarBlueButton") as HTMLButtonElement
    blueKartButton.addEventListener("click", () => {
        setMenuInvisible(MenuCSSProperty.CHOOSE_CAR)
        setMenuVisible(MenuCSSProperty.GAME_CANVAS, game)
        game.initGP(CarImagePath.BLUE)
    })

    const purpleKartButton = document.getElementById("chooseCarPurpleButton") as HTMLButtonElement
    purpleKartButton.addEventListener("click", () => {
        setMenuInvisible(MenuCSSProperty.CHOOSE_CAR)
        setMenuVisible(MenuCSSProperty.GAME_CANVAS, game)
        game.initGP(CarImagePath.PURPLE)
    })
}

