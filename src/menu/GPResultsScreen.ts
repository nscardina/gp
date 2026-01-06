import type { Game } from "../Game"
import type { IPCDisplayGPResultsObject } from "../multithreading/IPC"
import { MenuCSSProperty, setMenuInvisible, setMenuVisible } from "./MenuShared"


export const displayGPResults = (message: IPCDisplayGPResultsObject, game: Game) => {
    const resultsScreenContainerElement = document.getElementById("grandPrixFinalResultsContainer") as HTMLDivElement
    resultsScreenContainerElement.replaceChildren()

    {
        const title = document.createElement("h1")
        title.innerText = "GP Results"
        resultsScreenContainerElement.appendChild(title)
    }

    for (let i = 0; i < message.carPointTotals.length; i++) {
        const pointTotal = message.carPointTotals[i]

        const containerDiv = document.createElement("div")
        if (i === message.playerFinishingPosition) {
            containerDiv.classList.add("player")
        }

        containerDiv.classList.add("row")
        
        const nameElem = document.createElement("span")
        nameElem.classList.add("name")
        nameElem.innerText = pointTotal.name
        containerDiv.appendChild(nameElem)

        const pointElem = document.createElement("span")
        pointElem.classList.add("points")
        pointElem.innerText = `${pointTotal.points} ${pointTotal.points === 1 ? "pt." : "pts."}`
        containerDiv.appendChild(pointElem)

        resultsScreenContainerElement.appendChild(containerDiv)
    }

    {
        const okButton = document.createElement("button")
        okButton.classList.add("gp-button")
        okButton.innerText = "Ok"
        okButton.addEventListener("click", () => {
            setMenuInvisible(MenuCSSProperty.GP_FINAL_RESULTS_MENU)
            setMenuVisible(MenuCSSProperty.MAIN_MENU, game)
        })
        resultsScreenContainerElement.appendChild(okButton)
    }
}