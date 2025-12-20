import { makeDefaultKeybindMap, makeKeyPressedMap } from "../keybind/Keyboard";
import Car from "../physics/Car";
import LoadImage from "../util/LoadImage"
import { isIPCKeyDownEventObject, isIPCKeyUpEventObject } from "./IPC";

let keybindMap = makeDefaultKeybindMap()
let keyPressedMap = makeKeyPressedMap(keybindMap)

let offscreen: any, ctx: any;

let car = new Car()

let carImg: any = null

onmessage = async (e) => {

  if (e.data.type === "START") {
    const { width, height } = e.data;
    offscreen = new OffscreenCanvas(width / 4, height / 4);
    ctx = offscreen.getContext('2d');
    
    carImg = await LoadImage('/red_kart.png')
    const img = await LoadImage('/circuit.png');
    render(img);
  }

  if ("type" in e.data && typeof(e.data.type) === "string") {

    if (isIPCKeyDownEventObject(e.data)) {
      keyPressedMap.set(e.data.key, true)
    }

    if (isIPCKeyUpEventObject(e.data)) {
      keyPressedMap.set(e.data.key, false)
    }
  }
  
};

function render(img: any) {
  car.carUpdate(keybindMap, keyPressedMap)

  // draw background
  ctx.save();
  ctx.translate(offscreen.width / 2, offscreen.height / 2)
  ctx.rotate(-car.angle - Math.PI / 2);
  ctx.translate(-car.hitbox.getCenter().x, -car.hitbox.getCenter().y)
  ctx.drawImage(img, 0, 0)
  ctx.restore();

  // draw car
  ctx.save();
  ctx.translate((offscreen.width / 2) | 0, (offscreen.height / 2) | 0 )
  ctx.drawImage(carImg, (-carImg.width / 2) | 0, (-carImg.height / 2) | 0)

  ctx.restore();

  const bitmap = offscreen.transferToImageBitmap();
  postMessage({ bitmap }, [bitmap] as any);

  // 5. Request next frame
  requestAnimationFrame(() => render(img));
}