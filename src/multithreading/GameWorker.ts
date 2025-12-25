import { makeDefaultKeybindMap, makeKeyPressedMap } from "../keybind/Keyboard";
import Course from "../level/Course";
import Car from "../physics/Car";
import { gameLoop } from "./GameLoop";
import { gameState, setupGameState } from "./GameState";
import { isIPCKeyDownEventObject, isIPCKeyUpEventObject } from "./IPC";


onmessage = async (e) => {

  if (e.data.type === "START") {
    const { width, height } = e.data;

    const offscreen = new OffscreenCanvas(width / 4, height / 4);
    const ctx = offscreen.getContext('2d')!;

    const circuit = await Course.loadCourse("/circuit.gpc")

    const playerCar = new Car()

    const keybindMap = makeDefaultKeybindMap()
    const keyPressedMap = makeKeyPressedMap(keybindMap)

    setupGameState({
      offscreenCanvas: offscreen,
      ctx: ctx,
      course: circuit,
      cars: [playerCar],
      playerCar: playerCar,
      keybindMap: keybindMap,
      keyPressedMap: keyPressedMap
    })

    

    // render();
    requestAnimationFrame(gameLoop)

    
  }

  if ("type" in e.data && typeof(e.data.type) === "string") {

    const state = gameState()
    if (state !== null) {
      const { keyPressedMap } = state

      if (isIPCKeyDownEventObject(e.data)) {
        keyPressedMap.set(e.data.key, true)
      }

      if (isIPCKeyUpEventObject(e.data)) {
        keyPressedMap.set(e.data.key, false)
      }


    }

    
  }
  
};

